import * as ai from 'ai'
import * as tavily from './tavily'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createXai } from '@ai-sdk/xai'
import { createDeepSeek } from '@ai-sdk/deepseek'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { z } from 'zod'
import { useSettingsStore } from '@renderer/hooks/stores/useSettingsStore'
import chatSystemPrompt from '@renderer/prompts/chat-system.md?raw'
import improveSystemPrompt from '@renderer/prompts/improve-system.md?raw'
import autocompleteSystemPrompt from '@renderer/prompts/autocomplete-system.md?raw'
import mustache from 'mustache'
import { dictionaryToXmlString } from '@renderer/utils'
import { createOllama } from 'ollama-ai-provider-v2'

export type ChatStreamResponse = {
  textStream: AsyncIterable<string>
}

export type ThirdPartyLlmParams = {
  model: string
  headers?: Record<string, string>
  baseUrl?: string
  apiKey: string
}

export type LocalLlmParams = ThirdPartyLlmParams & {
  baseUrl: string
}

export type LlmConfig = {
  xai: ThirdPartyLlmParams
  openai: ThirdPartyLlmParams
  anthropic: ThirdPartyLlmParams
  google: ThirdPartyLlmParams
  deepseek: ThirdPartyLlmParams
  lmStudio: LocalLlmParams
  ollama: LocalLlmParams
}

export type LlmProvider = keyof LlmConfig

const getModel = () => {
  const { llmProvider, llmConfig } = useSettingsStore.getState()
  if (!llmProvider) {
    throw new Error('No LLM provider found')
  }
  switch (llmProvider) {
    case 'xai': {
      const params = llmConfig[llmProvider] as LlmConfig['xai']
      return createXai({
        apiKey: params.apiKey,
        headers: params.headers,
        baseURL: params.baseUrl
      })(params.model)
    }
    case 'openai': {
      const params = llmConfig[llmProvider] as LlmConfig['openai']
      return createOpenAI({
        apiKey: params.apiKey,
        headers: params.headers,
        baseURL: params.baseUrl
      })(params.model)
    }
    case 'anthropic': {
      const params = llmConfig[llmProvider] as LlmConfig['anthropic']
      return createAnthropic({
        apiKey: params.apiKey,
        headers: params.headers,
        baseURL: params.baseUrl
      })(params.model)
    }
    case 'google': {
      const params = llmConfig[llmProvider] as LlmConfig['google']
      return createGoogleGenerativeAI({
        baseURL: params.baseUrl,
        apiKey: params.apiKey,
        headers: params.headers
      })(params.model)
    }
    case 'deepseek': {
      const params = llmConfig[llmProvider] as LlmConfig['deepseek']
      return createDeepSeek({
        baseURL: params.baseUrl,
        apiKey: params.apiKey,
        headers: params.headers
      })(params.model)
    }
    case 'lmStudio': {
      const params = llmConfig[llmProvider] as LlmConfig['lmStudio']
      return createOpenAICompatible({
        apiKey: params.apiKey,
        baseURL: params.baseUrl,
        name: 'lmstudio',
        headers: params.headers
      })(params.model)
    }
    case 'ollama': {
      const params = llmConfig[llmProvider] as LlmConfig['ollama']
      return createOllama({
        baseURL: params.baseUrl,
        headers: params.headers
      })(params.model)
    }
  }
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
  const result = await ai.generateText({
    model,
    system: autocompleteSystemPrompt,
    prompt: dictionaryToXmlString({
      title,
      previous,
      next,
      current
    })
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

  const result = await ai.generateText({
    model,
    system: improveSystemPrompt,
    prompt: dictionaryToXmlString({
      title,
      content,
      paragraph,
      selection
    })
    // output: 'array',
    // schema: z.string()
  })

  return JSON.parse(result.text)
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
}): Promise<ChatStreamResponse> => {
  const { tavilyApiKey } = useSettingsStore.getState()
  const model = getModel()
  if (!model) {
    throw new Error('No model found')
  }

  return ai.streamText({
    model,
    system: mustache.render(chatSystemPrompt, {
      title,
      content
    }),
    messages,
    tools: {
      ...(tavilyApiKey && {
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
      })
    },
    stopWhen: ai.stepCountIs(10)
  })
}
