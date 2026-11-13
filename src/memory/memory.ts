import { randomUUID } from "node:crypto";
import { db } from "./database.js";
import type { ChatMessage } from "../types/agent.js";

export function createConversation(): string {
  const id = randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO conversations (id, created_at, updated_at)
    VALUES (?, ?, ?)
  `).run(id, now, now);

  return id;
}

export function getOrCreateConversation(id?: string): string {
  if (id) {
    const existing = db.prepare(`
      SELECT id FROM conversations WHERE id = ?
    `).get(id) as { id: string } | undefined;

    if (existing) return existing.id;
  }

  return createConversation();
}

export function saveMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string
): void {
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO messages (conversation_id, role, content, created_at)
    VALUES (?, ?, ?, ?)
  `).run(conversationId, role, content, now);

  db.prepare(`
    UPDATE conversations SET updated_at = ? WHERE id = ?
  `).run(now, conversationId);
}

export function getConversationHistory(
  conversationId: string
): ChatMessage[] {
  const rows = db.prepare(`
    SELECT role, content, created_at AS timestamp
    FROM messages
    WHERE conversation_id = ?
    ORDER BY id ASC
  `).all(conversationId);

  return rows.map((row) => ({
    role: row.role as "user" | "assistant",
    content: String(row.content),
    timestamp: String(row.timestamp)
  }));
}