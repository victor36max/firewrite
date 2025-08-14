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
    system: `You are an expert writing assistant that helps complete text intelligently. Your task is to analyze the current text and provide the most appropriate completion.

CONTEXT:
- Title: Document's theme and subject matter
- Previous paragraph: Content that came before (if available)
- Next paragraph: Content that follows (if available)
- Current text: The text that needs completion

COMPLETION LOGIC:
1. **Incomplete Sentence**: If the current text ends mid-sentence, complete it naturally
2. **Complete Sentence**: If the current text is a complete sentence, suggest the next logical sentence
3. **Context Awareness**: Use the title and surrounding paragraphs to maintain consistency

OUTPUT RULES:
- Return only the completion text, no additional formatting
- If completing a sentence, start with a space if needed after punctuation
- If starting a new sentence, begin with proper capitalization
- Maintain the document's writing style and tone
- Keep suggestions concise and contextually relevant

EXAMPLES:
Input: "The weather today is"
Output: " beautiful and sunny."

Input: "The weather today is beautiful and sunny."
Output: "I think I'll go for a walk in the park."

Input: "She opened the door and"
Output: " stepped inside cautiously."
`,
    prompt: `
<title>${title}</title>
${previous ? `<previous>${previous}</previous>` : ''}
${next ? `<next>${next}</next>` : ''}
<current>${current || ''}</current>`
  })

  return result.text
}

export const generateImprovementSuggestions = async ({
  title,
  content,
  paragraph,
  selection
}: {
  title: string
  content: string
  paragraph: string
  selection: string
}) => {
  const model = getModel()
  if (!model) {
    throw new Error('No model found')
  }

  const result = await ai.generateObject({
    model,
    system: `You are an expert writing assistant specializing in text improvement and refinement. Your task is to analyze a selected piece of text within its broader context and provide 5 high-quality improvement suggestions.

CONTEXT ANALYSIS:
- Title: The document's title provides thematic context
- Full Content: The complete document establishes writing style, tone, and voice
- Current Paragraph: The immediate context where the selection appears
- Selection: The specific text that needs improvement

IMPROVEMENT CRITERIA:
1. **Style Consistency**: Maintain the same writing style, tone, and voice as the surrounding content
2. **Contextual Fit**: Ensure suggestions flow naturally within the current paragraph
3. **Enhanced Clarity**: Improve precision, conciseness, or impact where appropriate
4. **Variety**: Provide diverse approaches (synonyms, restructuring, alternative phrasing)
5. **Quality**: Each suggestion should be genuinely better than the original

OUTPUT FORMAT:
- Return exactly 5 improvement suggestions
- Each suggestion should be the complete replacement text for the selection
- Do not include quotes, markdown, or any formatting
- Ensure each suggestion is grammatically correct and contextually appropriate
- Suggestions should be roughly the same length as the original selection

EXAMPLE:
Title: "The Great Gatsby"
Content: "The Great Gatsby is a novel by F. Scott Fitzgerald. It is a story about a man who is trying to get rich and famous."
Paragraph: "The Great Gatsby is a novel by F. Scott Fitzgerald. It is a story about a man who is trying to get rich and famous."
Selection: "who is trying to get rich and famous"

Output: [
  "who is striving to achieve wealth and fame",
  "who is pursuing riches and renown",
  "who is working toward fortune and celebrity",
  "who is seeking prosperity and recognition",
  "who is attempting to attain affluence and stardom"
]`,
    prompt: `
    <title>${title}</title>
    <content>${content}</content>
    <paragraph>${paragraph}</paragraph>
    <selection>${selection}</selection>
    `,
    schema: z.object({
      improvementSuggestions: z.array(z.string())
    })
  })

  return result.object.improvementSuggestions
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
    system: `You are an expert writing assistant helping authors improve their work. You have access to the current document's title and content, plus a web search tool for research.

ROLE:
- Answer the writer's questions about their document
- Provide helpful writing advice and suggestions
- Use web search when you need additional information to answer effectively

RESPONSE GUIDELINES:
- Base your answers on the document's title and content
- If your response is lengthy, structure it with clear markdown formatting
- When using web search results, include URLs as references and citations
- Be specific, actionable, and supportive in your advice
- Maintain a helpful, professional tone

CONTEXT:
<title>${title}</title>
<content>${content}</content>`,
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
