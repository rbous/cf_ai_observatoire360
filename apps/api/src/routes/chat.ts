/**
 * Agentic chat endpoint — ReAct-style tool-calling loop with Llama 3.3.
 */

import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq, desc } from "drizzle-orm";
import { chatMessages } from "../db/schema.js";
import { ulid } from "../lib/ulid.js";
import { TOOLS, TOOLS_PROMPT, type ToolContext } from "../lib/chat-tools.js";
import type { Bindings } from "../types.js";
import type { AuthVariables } from "../middleware/auth.js";

const chat = new Hono<{ Bindings: Bindings; Variables: AuthVariables }>();

const TOOL_CALL_REGEX = /\[TOOL:(\w+)\]\s*(\{[\s\S]*?\})/;
const MAX_ITERATIONS = 5;
const MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractAIText(response: unknown): string {
    if (typeof response === "string") return response;
    if (response && typeof response === "object") {
        const r = response as Record<string, unknown>;
        if (typeof r.response === "string") return r.response;
        if (typeof r.response === "object" && r.response) return JSON.stringify(r.response);
        if (typeof r.text === "string") return r.text;
        if (typeof r.content === "string") return r.content;
        return JSON.stringify(r);
    }
    return String(response);
}

function now(): number {
    return Math.floor(Date.now() / 1000);
}

// ---------------------------------------------------------------------------
// POST / — Main chat endpoint
// ---------------------------------------------------------------------------

chat.post("/", async (c) => {
    const userId = c.get("userId");
    const municipalityId = c.get("municipalityId");
    const role = c.get("role");
    const db = drizzle(c.env.DB);

    const body = await c.req.json().catch(() => null) as { message?: string; locale?: string } | null;
    if (!body?.message?.trim()) {
        return c.json({ error: "VALIDATION_ERROR", message: "Message requis.", statusCode: 422 }, 422);
    }

    const userMessage = body.message.trim();
    const locale = body.locale ?? "fr";

    // 1. Fetch conversation history (last 20 messages)
    const history = await db.select()
        .from(chatMessages)
        .where(eq(chatMessages.userId, userId))
        .orderBy(desc(chatMessages.createdAt))
        .limit(20);

    // Reverse to chronological order
    history.reverse();

    // 2. Build messages array with locale instruction
    const langInstruction = locale === "en"
        ? "\n\nIMPORTANT: The user's interface is in English. You MUST respond in English."
        : "\n\nIMPORTANT: L'interface de l'utilisateur est en français. Répondez en français.";

    const messages: { role: string; content: string }[] = [
        { role: "system", content: TOOLS_PROMPT + langInstruction },
    ];

    for (const msg of history) {
        if (msg.role === "tool") {
            messages.push({ role: "user", content: `[Tool result for ${msg.toolName}]: ${msg.content}` });
        } else {
            messages.push({ role: msg.role, content: msg.content });
        }
    }

    messages.push({ role: "user", content: userMessage });

    // 3. Save user message
    await db.insert(chatMessages).values({
        id: ulid(), municipalityId, userId,
        role: "user", content: userMessage,
        createdAt: now(),
    });

    // 4. Tool context
    const toolCtx: ToolContext = {
        municipalityId, userId, role, db,
        queue: c.env.DETECTION_QUEUE,
    };

    // 5. ReAct loop
    const toolCalls: { name: string; args: string; result: string }[] = [];
    let finalAnswer = "";

    for (let i = 0; i < MAX_ITERATIONS; i++) {
        let aiText: string;
        try {
            const response = await c.env.AI.run(
                MODEL as Parameters<typeof c.env.AI.run>[0],
                { messages, max_tokens: 2048, temperature: 0.3 },
            );
            aiText = extractAIText(response);
        } catch (err) {
            console.error("[chat] AI call failed:", err);
            finalAnswer = "Désolé, une erreur s'est produite lors du traitement de votre message. Veuillez réessayer.";
            break;
        }

        if (!aiText) {
            finalAnswer = "Désolé, je n'ai pas pu générer de réponse.";
            break;
        }

        // Check for tool call
        const toolMatch = aiText.match(TOOL_CALL_REGEX);

        if (toolMatch) {
            const toolName = toolMatch[1];
            const toolArgsStr = toolMatch[2];
            let toolArgs: Record<string, unknown> = {};

            try {
                toolArgs = JSON.parse(toolArgsStr);
            } catch {
                // If JSON parse fails, try to extract what we can
                console.warn("[chat] Failed to parse tool args:", toolArgsStr);
            }

            const tool = TOOLS[toolName];
            if (!tool) {
                // Unknown tool — tell the LLM
                const errMsg = `Unknown tool: ${toolName}. Available tools: ${Object.keys(TOOLS).join(", ")}`;
                messages.push({ role: "assistant", content: aiText });
                messages.push({ role: "user", content: `[Tool error]: ${errMsg}` });
                continue;
            }

            // Execute tool
            let result: string;
            try {
                result = await tool.execute(toolArgs, toolCtx);
            } catch (err) {
                result = JSON.stringify({ error: String(err instanceof Error ? err.message : err) });
            }

            // Save assistant message (with tool call)
            await db.insert(chatMessages).values({
                id: ulid(), municipalityId, userId,
                role: "assistant", content: aiText,
                toolName, toolArgs: toolArgsStr,
                createdAt: now(),
            });

            // Save tool result
            await db.insert(chatMessages).values({
                id: ulid(), municipalityId, userId,
                role: "tool", content: result,
                toolName, createdAt: now(),
            });

            toolCalls.push({ name: toolName, args: toolArgsStr, result });

            // Append to messages for next iteration
            messages.push({ role: "assistant", content: aiText });
            messages.push({ role: "user", content: `[Tool result for ${toolName}]: ${result}` });

            continue; // Loop back to LLM
        }

        // No tool call — this is the final answer
        finalAnswer = aiText;
        break;
    }

    // 6. Save final answer
    if (finalAnswer) {
        await db.insert(chatMessages).values({
            id: ulid(), municipalityId, userId,
            role: "assistant", content: finalAnswer,
            createdAt: now(),
        });
    }

    return c.json({ reply: finalAnswer, toolCalls: toolCalls.length > 0 ? toolCalls : undefined });
});

// ---------------------------------------------------------------------------
// GET /history — Chat history
// ---------------------------------------------------------------------------

chat.get("/history", async (c) => {
    const userId = c.get("userId");
    const db = drizzle(c.env.DB);

    const rows = await db.select()
        .from(chatMessages)
        .where(eq(chatMessages.userId, userId))
        .orderBy(desc(chatMessages.createdAt))
        .limit(30);

    // Return in chronological order
    rows.reverse();

    return c.json({ messages: rows });
});

// ---------------------------------------------------------------------------
// DELETE /history — Clear chat
// ---------------------------------------------------------------------------

chat.delete("/history", async (c) => {
    const userId = c.get("userId");
    const db = drizzle(c.env.DB);

    await db.delete(chatMessages).where(eq(chatMessages.userId, userId));

    return c.json({ success: true });
});

export default chat;
