type TavilySearchResult = {
  results: {
    title: string
    content: string
  }[]
}

type TavilySearchParams = {
  query: string
  maxResults?: number
}

export const search = async (params: TavilySearchParams): Promise<TavilySearchResult> => {
  const result = await fetch(`https://api.tavily.com/search`, {
    method: 'POST',
    body: JSON.stringify({
      query: params.query,
      max_results: params.maxResults || 5
    }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.PUBLIC_TAVILY_API_KEY}`
    }
  })
  return (await result.json()) as TavilySearchResult
}
