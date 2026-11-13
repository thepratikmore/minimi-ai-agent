
import { tavily } from "@tavily/core";
import dotenv from "dotenv";
import type { SearchResult } from "../types/agent.js";

dotenv.config();

if (!process.env.TAVILY_API_KEY) {
  throw new Error("TAVILY_API_KEY is missing from .env");
}

const client = tavily({
  apiKey: process.env.TAVILY_API_KEY
});

function normalizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);

    parsed.search = "";
    parsed.hash = "";

    return parsed.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

function isFeedUrl(url: string): boolean {
  try {
    const path = new URL(url).pathname.toLowerCase();

    return (
      path.endsWith(".xml") ||
      path.includes("/rss") ||
      path.includes("/feed")
    );
  } catch {
    return false;
  }
}

function isGenericIndexPage(url: string): boolean {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.replace(/\/+$/, "").toLowerCase();

    if (isFeedUrl(url)) {
      return false;
    }

    const genericPaths = [
      "",
      "/news",
      "/blog",
      "/about",
      "/research",
      "/index",
      "/news/product-releases",
      "/index/",
      "/blog/"
    ];

    return genericPaths.includes(path);
  } catch {
    return true;
  }
}

function cleanArticleContent(content: string): string {
  const cleaned = content
    .replace(/\r\n/g, "\n")
    .replace(/\[Skip to main content\]\([^)]+\)/gi, "")
    .replace(/\[\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\(opens in a new window\)/gi, "")
    .replace(/<[^>]+>/g, " ");

  const navigationTerms = new Set([
    "research",
    "products",
    "business",
    "developers",
    "company",
    "foundation",
    "log in",
    "login",
    "try chatgpt",
    "latest advancements",
    "safety",
    "security & privacy",
    "trust & transparency",
    "api platform",
    "home",
    "overview",
    "suggested",
    "primary navigation",
    "share",
    "audio",
    "loading"
  ]);

  const seen = new Set<string>();
  const usefulLines: string[] = [];

  for (const rawLine of cleaned.split("\n")) {
    const line = rawLine
      .replace(/^[*#>|]+\s*/, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!line || line.length < 2) {
      continue;
    }

    const normalized = line.toLowerCase();

    if (navigationTerms.has(normalized)) {
      continue;
    }

    if (
      /^(home|docs|api dashboard|search developer resources)$/i.test(line)
    ) {
      continue;
    }

    if (seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    usefulLines.push(line);
  }

  return usefulLines.join("\n").slice(0, 9000);
}

function isUsefulContent(content: string, url: string): boolean {
  if (!content.trim()) {
    return false;
  }

  // RSS feeds are useful for discovering individual article URLs.
  if (isFeedUrl(url)) {
    return /https?:\/\//i.test(content);
  }

  // Avoid returning pages that contain only site navigation.
  const navigationOnly =
    /^(research|products|business|developers|company|foundation|log in|login|try chatgpt|home|overview|suggested|primary navigation)$/i;

  const meaningfulLines = content
    .split("\n")
    .map((line) => line.trim())
    .filter(
      (line) =>
        line.length > 20 &&
        !navigationOnly.test(line.toLowerCase())
    );

  return meaningfulLines.length > 0;
}

export async function webSearch(
  query: string | string[]
): Promise<SearchResult[]> {
  const queries = [
    ...new Set(
      (Array.isArray(query) ? query : [query])
        .map((item) => item.trim())
        .filter(Boolean)
    )
  ].slice(0, 3);

  if (queries.length === 0) {
    throw new Error("At least one meaningful search query is required.");
  }

  const responses = await Promise.all(
    queries.map((searchQuery) =>
      client.search(searchQuery, {
        searchDepth: "advanced",
        maxResults: 10,
        includeAnswer: false,
        includeRawContent: "markdown"
      })
    )
  );

  const uniqueResults = new Map<string, SearchResult>();

  for (const response of responses) {
    for (const item of response.results) {
      if (!item.url || !item.title) {
        continue;
      }

      const normalizedUrl = normalizeUrl(item.url);

      if (!normalizedUrl || isGenericIndexPage(item.url)) {
        continue;
      }

      const rawContent =
        item.rawContent?.trim() ||
        item.content?.trim() ||
        "";

      const content = cleanArticleContent(rawContent);

      if (!isUsefulContent(content, item.url)) {
        continue;
      }

      const result: SearchResult = {
        title: item.title.trim(),
        url: item.url,
        content
      };

      const existing = uniqueResults.get(normalizedUrl);

      if (!existing || result.content.length > existing.content.length) {
        uniqueResults.set(normalizedUrl, result);
      }
    }
  }

  return Array.from(uniqueResults.values());
}
