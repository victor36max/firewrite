import * as ai from 'ai'
import * as tavily from './tavily'
import { createAzure } from '@ai-sdk/azure'
import { z } from 'zod'
import { useSettingsStore } from '@renderer/hooks/stores/useSettingsStore'

const getModel = () => {
  const { azureApiKey, azureResourceName } = useSettingsStore.getState()
  if (azureApiKey && azureResourceName) {
    return createAzure({
      apiKey: azureApiKey,
      resourceName: azureResourceName
    })('gpt-4o-mini')
  }

  return null
}

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
  const model = getModel()
  if (!model) {
    throw new Error('No model found')
  }

  const result = await ai.generateText({
    model,
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

export const generateResearch = async ({
  title,
  content,
  selection
}: {
  title: string
  content: string
  selection: string | null
}): Promise<void> => {
  const model = getModel()
  if (!model) {
    throw new Error('No model found')
  }

  const {
    object: { queries }
  } = await ai.generateObject({
    model,
    schema: z.object({
      queries: z.array(z.string())
    }),
    system: `
  You are a research assistant of a writer. You are given a title, content and selection.
  You need to generate a list of 5 queries that we will put in a search engine to find the
  best information in order to expand and/or improve the content.
  `,
    prompt: `
          <title>${title}</title>
          <content>${content}</content>
          <selection>${selection}</selection>
          `
  })

  const contentList = (await Promise.all(queries.map((query) => tavily.search({ query }))))
    .flatMap((result) => result.results)
    .map((result) => result.content)

  const researchReport = await ai.generateText({
    model,
    system: `
    You are a research assistant of a writer. 
    You are given a title, content and selection.
    Also, you are given a list of content that we found in a search engine.
    You need to produce a research report that will be used to expand and/or improve the content.
    `,
    prompt: `
    <title>${title}</title>
    <content>${content}</content>
    <selection>${selection}</selection>
    <contentList>${contentList.join('\n')}</contentList>
    `
  })

  console.log(researchReport.text)
}

export const streamChatResponse = async ({
  title,
  content,
  messages
}: {
  title: string
  content: string
  messages: {
    role: 'user' | 'assistant'
    content: string
  }[]
}) => {
  const model = getModel()
  if (!model) {
    throw new Error('No model found')
  }

  return ai.streamText({
    model,
    system: `
     You are a writer assistant. You are given a current title, content and the writer's query.
     You need to answer the query based on the title and content.
     If you need to do research in order to answer the query, you can use the web search tool.

     Format:
     - If your answer is long, make it in a well structured markdown.
     - If the results from the web search contains URLs, incorporate them in the answer as references and citations.

     <title>${title}</title>
     <content>${content}</content>
    `,
    messages,
    tools: {
      webSearch: ai.tool({
        description: 'Search the web for information',
        inputSchema: z.object({
          query: z.string(),
          maxResults: z.number().optional()
        }),
        execute: async (params) => {
          const result = await tavily.search(params)
          return result.results
        }
      })
    },
    stopWhen: ai.stepCountIs(10)
  })
}
