# Minimi AI Agent – Design Document

## 1. Project Overview

Minimi AI Agent is an intelligent conversational assistant that combines an LLM, web search, and persistent conversation memory. It can answer general questions, retrieve current information from the web, and recall previous discussions to provide context-aware responses.

## 2. Technology Stack

- **Language:** TypeScript
- **Runtime:** Node.js
- **Backend:** Express.js
- **LLM:** Groq API (`openai/gpt-oss-120b`)
- **Web Search:** Tavily API
- **Database:** SQLite (`node:sqlite`)
- **Configuration:** dotenv

## 3. System Architecture

The application follows a modular architecture with clearly separated responsibilities.

- **API Layer – `src/index.ts`:** Handles HTTP requests, validates incoming messages, manages conversation IDs, retrieves conversation history, and returns responses.
- **Agent Layer – `src/agent/agent.ts`:** Controls the agent workflow, prepares conversation context, decides when web search is required, executes the search tool, and generates final responses.
- **Memory Layer – `src/memory/`:** Stores conversations and messages in SQLite and retrieves previous messages for future interactions.
- **LLM Service – `src/services/llm.ts`:** Manages communication with the Groq language model.
- **Search Service – `src/services/search.ts`:** Integrates Tavily web search and processes search results.
- **Types – `src/types/agent.ts`:** Defines shared TypeScript interfaces.

## 4. Tool Design

The agent exposes exactly one external tool: `web_search`.

The tool accepts focused search queries and retrieves relevant web results containing titles, URLs, and content.

The agent uses web search when a request requires current or external information. Retrieved results are provided to the language model as context, and relevant source URLs are included in the API response.

## 5. Conversation Memory

The application uses SQLite for persistent conversation storage.

Each conversation is assigned a unique ID. User and assistant messages are stored with timestamps and associated with that conversation.

For every new request, the application retrieves the existing conversation history and passes it to the agent. This enables the assistant to recall previous discussions, answer follow-up questions, and maintain context across multiple requests.

## 6. Key Design Decisions

- Used TypeScript to improve type safety and maintainability.
- Separated the application into independent modules.
- Used SQLite for lightweight persistent storage.
- Implemented a single external search tool to keep the agent focused.
- Used conversation IDs to maintain separate user conversations.
- Included source processing and filtering to improve web research quality.
- Kept API credentials in environment variables rather than source code.

## 7. Future Improvements

- Add conversation summarization for efficient long-term memory.
- Improve search relevance and source verification.
- Expand automated testing for agent behavior.
- Develop a frontend chat interface.
- Improve error handling and observability.

## 8. Conclusion

Minimi AI Agent demonstrates how an LLM can be combined with external web search and persistent memory to build a practical conversational AI system. Its modular architecture makes it easier to maintain, test, and extend.

