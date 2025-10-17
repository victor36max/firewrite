import { useQuery } from '@tanstack/react-query'

export const usePlatformQuery = () => {
  return useQuery({
    queryKey: ['platform'],
    queryFn: window.api.getPlatform
  })
}
