type SearchResult = {
  success: boolean;
  result: {
    object: "vector_store.search_results.page";
    search_query: string;
    response: string;
    data: Array<{
      file_id: string;
      filename: string;
      score: number;
      attributes: {
        modified_date: number; // unix timestamp
        folder: string;
      };
      content: Array<{
        id: string;
        type: "text";
        text: string;
      }>;
    }>;
    has_more: boolean;
    next_page: string | null;
  };
};

type Filter = {
  type: "and" | "or";
  filters: Array<{
    type: "eq" | "ne" | "gt" | "gte" | "lt" | "lte";
    key: "folder" | "prefix";
    value: string;
  }>;
};

export const autoRag = async (
  query: string,
  options: { ranking_options?: { score_threshold: number }; filter: Filter }
) => {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.R2_ACCOUNT_ID}/autorag/rags/${process.env.AUTORAG_NAME}/ai-search`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AUTORAG_API_TOKEN}`,
      },
      body: JSON.stringify({ query, ...options }),
    }
  );

  if (!res.ok) {
    console.error("AutoRAG error:", await res.text());
    throw new Error("Failed to fetch AutoRAG");
  }

  const data = await res.json();
  return data as SearchResult;
};
