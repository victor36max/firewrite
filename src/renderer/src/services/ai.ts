import * as ai from 'ai'
import { createAzure } from '@ai-sdk/azure'

const azure = createAzure({
  apiKey: import.meta.env.PUBLIC_AZURE_API_KEY,
  resourceName: import.meta.env.PUBLIC_AZURE_RESOURCE_NAME,
  apiVersion: import.meta.env.PUBLIC_AZURE_API_VERSION
})

export const generateAutocompleteSuggestion = async ({
  title,
  previous,
  current,
  next
}: {
  title: string
  previous: string | null
  current: string | null
  next: string | null
}): Promise<string> => {
  const result = await ai.generateText({
    model: azure('gpt-4o-mini'),
    system: `
You are a writing assistant. You are given a text and you need to autocomplete the text.
If the sentence is not complete, you need to return the text needed to complete the sentence.
Otherwise, return what you think is the best for the next sentence.

You are given the title, ${[previous && 'previous', next && 'next'].filter(Boolean).join(' and ')} paragraph as your context.
<title>${title}</title>
${previous ? `<previous>${previous}</previous>` : ''}
${next ? `<next>${next}</next>` : ''}

Format:
- Return only the text needed to complete the autocomplete suggestion.
- Do not include any other text or formatting (e.g. markdown, html, quotes, etc.)
- If the sentence is complete with a punctuation mark without a space after it, add a space at the start of the autocomplete suggestion.

Example:
Input: "Hello, how are"
Output: " you?"

Input: "Hello, how are you?"
Output: "I'm fine, thank you!"
`,
    prompt: current || ''
  })

  return result.text
}
