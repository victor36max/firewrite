import { useSettingsStore } from '@renderer/hooks/stores/useSettingsStore'

type TavilySearchResult = {
  results: {
    title: string
    content: string
    url: string
  }[]
}

type TavilySearchParams = {
  query: string
  maxResults?: number
}

export const search = async (params: TavilySearchParams): Promise<TavilySearchResult> => {
  const { tavilyApiKey } = useSettingsStore.getState()
  if (!tavilyApiKey) {
    throw new Error('Tavily API key is not set')
  }

  const result = await fetch(`https://api.tavily.com/search`, {
    method: 'POST',
    body: JSON.stringify({
      query: params.query,
      max_results: params.maxResults || 5
    }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tavilyApiKey}`
    }
  })
  return (await result.json()) as TavilySearchResult
}
