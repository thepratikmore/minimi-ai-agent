
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { runAgent } from "./agent/agent.js";
import {
  getOrCreateConversation,
  saveMessage,
  getConversationHistory
} from "./memory/memory.js";
import "./memory/database.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Minimi AI Agent API is running!" });
});

app.post("/chat", async (req, res) => {
  try {
    const { message, conversationId } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      res.status(400).json({ error: "A valid message is required." });
      return;
    }

    const id = getOrCreateConversation(conversationId);

    const history = getConversationHistory(id);

    saveMessage(id, "user", message.trim());

    const result = await runAgent(message.trim(), history);

    saveMessage(id, "assistant", result.reply);

    res.json({
      conversationId: id,
      ...result
    });
  } catch (error) {
    console.error("Chat Error:", error);

    res.status(500).json({
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
