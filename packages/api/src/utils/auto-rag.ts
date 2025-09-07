// {
//   "success": true,
//   "result": {
//     "object": "vector_store.search_results.page",
//     "search_query": "How do I train a llama to deliver coffee?",
//     "data": [
//       {
//         "file_id": "llama001",
//         "filename": "llama/logistics/llama-logistics.md",
//         "score": 0.45,
//         "attributes": {
//           "modified_date": 1735689600000,   // unix timestamp for 2025-01-01
//           "folder": "llama/logistics/",
//         },
//         "content": [
//           {
//             "id": "llama001",
//             "type": "text",
//             "text": "Llamas can carry 3 drinks max."
//           }
//         ]
//       },
//       {
//         "file_id": "llama042",
//         "filename": "llama/llama-commands.md",
//         "score": 0.4,
//         "attributes": {
//           "modified_date": 1735689600000,   // unix timestamp for 2025-01-01
//           "folder": "llama/",
//         },
//         "content": [
//           {
//             "id": "llama042",
//             "type": "text",
//             "text": "Start with basic commands like 'Espresso Express!' Llamas love alliteration."
//           }
//         ]
//       },
//     ],
//     "has_more": false,
//     "next_page": null
//   }
// }

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

export const autoRag = async (query: string, options: { filter: Filter }) => {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.R2_ACCOUNT_ID}/autorag/rags/${process.env.AUTORAG_NAME}/ai-search`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AUTORAG_API_TOKEN}`,
      },
      body: JSON.stringify({ query, filter: options.filter }),
    }
  );

  if (!res.ok) {
    console.error("AutoRAG error:", await res.text());
    throw new Error("Failed to fetch AutoRAG");
  }

  const data = await res.json();
  return data as SearchResult;
};
