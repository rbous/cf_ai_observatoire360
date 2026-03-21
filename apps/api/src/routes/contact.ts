import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { contactSchema } from "@observatoire360/shared";
import { contactSubmissions } from "../db/schema.js";
import { ulid } from "../lib/ulid.js";
import type { Bindings } from "../types.js";

const contactRouter = new Hono<{ Bindings: Bindings }>();

// ---------------------------------------------------------------------------
// POST /contact — public, no auth required
// ---------------------------------------------------------------------------

contactRouter.post("/", async (c) => {
    const body = await c.req.json().catch(() => null);
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
        return c.json(
            {
                error: "VALIDATION_ERROR",
                message: "Données invalides.",
                details: parsed.error.flatten().fieldErrors,
                statusCode: 422,
            },
            422,
        );
    }

    const { name, position, municipality, email, description } = parsed.data;
    const db = drizzle(c.env.DB);
    const ts = Math.floor(Date.now() / 1000);

    await db.insert(contactSubmissions).values({
        id: ulid(),
        name,
        position: position ?? null,
        municipality: municipality ?? null,
        email,
        description: description ?? null,
        createdAt: ts,
    });

    return c.json(
        {
            success: true,
            message:
                "Votre message a bien été reçu. Nous vous contacterons sous peu.",
        },
        201,
    );
});

export default contactRouter;
