# 🤖 Minimi AI Agent

An intelligent conversational AI agent built with TypeScript, Groq, Tavily, and SQLite. It can answer questions, search the web for current information, and remember previous conversations.

## ✨ Features

- **AI-Powered Conversations:** Uses Groq LLM to generate natural-language responses.
- **Web Search:** Uses Tavily to retrieve current information from the web.
- **Persistent Memory:** Stores conversation history in SQLite.
- **Context Awareness:** Recalls previous discussions using conversation IDs.
- **Source References:** Returns relevant source titles and URLs with search-based responses.
- **Modular Architecture:** Separates agent logic, memory, API, and external services.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| TypeScript | Programming language |
| Node.js | Runtime |
| Express.js | REST API |
| Groq API | Language model |
| Tavily API | Web search |
| SQLite | Persistent conversation storage |

## 📁 Project Structure

```text
minimi-ai-agent/
├── src/
│   ├── agent/
│   │   └── agent.ts
│   ├── memory/
│   │   ├── database.ts
│   │   └── memory.ts
│   ├── services/
│   │   ├── llm.ts
│   │   └── search.ts
│   ├── types/
│   │   └── agent.ts
│   └── index.ts
├── data/
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
├── DESIGN.md
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/thepratikmore/minimi-ai-agent.git
cd minimi-ai-agent
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root using `.env.example` as a template.

```env
PORT=3000
GROQ_API_KEY=your_groq_api_key
TAVILY_API_KEY=your_tavily_api_key
```

Get your API keys from:

- Groq: https://console.groq.com/keys
- Tavily: https://app.tavily.com/

Never commit your `.env` file or expose your API keys.

### 4. Start the application

```bash
npm run dev
```

The server will start at:

```text
http://localhost:3000
```

## 🔌 API Usage

### Health Check

**Endpoint:** `GET /`

### Chat

**Endpoint:** `POST /chat`

**Request Body:**

```json
{
  "message": "What are the latest developments in AI?"
}
```

To continue an existing conversation, provide its conversation ID:

```json
{
  "conversationId": "your-existing-conversation-id",
  "message": "What did we discuss earlier?"
}
```

**Response:**

```json
{
  "conversationId": "generated-conversation-id",
  "reply": "AI-generated response...",
  "searchedWeb": true,
  "sources": [
    {
      "title": "Example source",
      "url": "https://example.com",
      "content": "Relevant search result..."
    }
  ]
}
```

The response above illustrates the API structure. Actual sources and answers depend on the request.

## 🧠 How It Works

1. The user sends a message through the chat API.
2. The application retrieves the conversation history from SQLite.
3. The agent processes the message and decides whether web search is needed.
4. If required, the agent calls its `web_search` tool through Tavily.
5. The LLM generates a response using the available context and search results.
6. The user message and assistant response are stored in SQLite.
7. The API returns the response, conversation ID, and sources.

## 🏗️ Design Document

For architecture details, tool design, memory management, and design decisions, see [DESIGN.md](./DESIGN.md).

## 🚀 Future Improvements

- Conversation summarization for long-term memory.
- Improved source verification and search relevance.
- Automated testing and evaluation.
- Frontend chat interface.
- Better monitoring and error handling.

## 👨‍💻 Author

**Pratik More**

- GitHub: [@thepratikmore](https://github.com/thepratikmore)
- LinkedIn: [Pratik More](https://linkedin.com/in/pratik-b-more)

---

Built as an AI agent project demonstrating LLM integration, web search, and persistent conversational memory.
