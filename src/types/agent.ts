
export interface SearchResult {
  title: string;
  url: string;
  content: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface AgentRequest {
  conversationId: string;
  message: string;
}

export interface AgentResponse {
  conversationId: string;
  reply: string;
  searchedWeb: boolean;
  sources: SearchResult[];
}
