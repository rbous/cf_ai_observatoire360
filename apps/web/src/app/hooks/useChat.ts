import { useState, useCallback } from "react";
import { api } from "@/app/lib/api";

interface ChatMessage {
    id: string;
    role: "user" | "assistant" | "tool";
    content: string;
    toolName: string | null;
    toolArgs: string | null;
    createdAt: number;
}

interface ToolCall {
    name: string;
    args: string;
    result: string;
}

export function useChat() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadHistory = useCallback(async () => {
        try {
            const data = await api.get<{ messages: ChatMessage[] }>("/chat/history");
            setMessages(data.messages);
        } catch { /* ignore */ }
    }, []);

    const sendMessage = useCallback(async (text: string, locale?: string) => {
        // Add optimistic user message
        const userMsg: ChatMessage = {
            id: "temp-" + Date.now(),
            role: "user",
            content: text,
            toolName: null,
            toolArgs: null,
            createdAt: Math.floor(Date.now() / 1000),
        };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const res = await api.post<{ reply: string; toolCalls?: ToolCall[] }>("/chat", { message: text, locale });

            // Add tool call messages if any
            const newMsgs: ChatMessage[] = [];
            if (res.toolCalls) {
                for (const tc of res.toolCalls) {
                    newMsgs.push({
                        id: "tool-" + Date.now() + Math.random(),
                        role: "tool",
                        content: tc.result,
                        toolName: tc.name,
                        toolArgs: tc.args,
                        createdAt: Math.floor(Date.now() / 1000),
                    });
                }
            }

            // Add assistant reply
            newMsgs.push({
                id: "asst-" + Date.now(),
                role: "assistant",
                content: res.reply,
                toolName: null,
                toolArgs: null,
                createdAt: Math.floor(Date.now() / 1000),
            });

            setMessages(prev => [...prev, ...newMsgs]);
        } catch {
            setMessages(prev => [...prev, {
                id: "err-" + Date.now(),
                role: "assistant",
                content: locale === "en" ? "Sorry, an error occurred." : "Désolé, une erreur s'est produite.",
                toolName: null,
                toolArgs: null,
                createdAt: Math.floor(Date.now() / 1000),
            }]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearHistory = useCallback(async () => {
        try {
            await api.delete("/chat/history");
            setMessages([]);
        } catch { /* ignore */ }
    }, []);

    return { messages, isLoading, sendMessage, clearHistory, loadHistory };
}
