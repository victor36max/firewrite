import { useState } from 'react'

export const useRerender = () => {
  const [key, setKey] = useState(0)
  const rerender = () => {
    setKey((prev) => prev + 1)
  }
  return [key, rerender] as const
}
