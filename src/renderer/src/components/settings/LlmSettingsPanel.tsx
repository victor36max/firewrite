import { Input } from '@renderer/components/primitives/Input'
import { Label } from '@renderer/components/primitives/Label'
import { useSettingsStore } from '@renderer/hooks/stores/useSettingsStore'
import { Select } from '@renderer/components/primitives/Select'
import { LlmProvider, LocalLlmParams, ThirdPartyLlmParams } from '@renderer/services/ai'
import { SiAnthropic, SiGooglegemini, SiOllama, SiOpenai } from 'react-icons/si'
import { XAI, DeepSeek, LmStudio } from '@lobehub/icons'
import { Form, TextField } from 'react-aria-components'
import { Button } from '../primitives/Button'
import { FieldError } from '../primitives/FieldError'
import { useToast } from '@renderer/hooks/useToast'
import { useState } from 'react'
import { HeadersField } from '../HeadersField'
import { isValidUrl } from '@renderer/utils'
import { trackEvent } from '@renderer/services/tracking'

const isLocalLlmProvider = (provider: LlmProvider): boolean => {
  return ['ollama', 'lmStudio'].includes(provider)
}

const isHeadersEmpty = (obj?: Record<string, string | null>): boolean => {
  if (!obj) return true
  if (Object.keys(obj).length === 0) return true
  return Object.values(obj).every((value) => value === null || value === '')
}

const getHeadersFromFormData = (formData: FormData) => {
  const headers = Object.fromEntries(
    formData
      .entries()
      .reduce(
        (acc, [key, value]) => {
          const matches = key.match(/^headers\[(\d+)\]\.(name|value)$/)
          if (!matches) return acc
          const index = matches[1]
          const field = matches[2]
          if (!acc[index]) acc[index] = []
          if (field === 'name') acc[index][0] = value
          else if (field === 'value') acc[index][1] = value
          return acc
        },
        [] as [string, string][]
      )
      .filter(([name, value]) => !!name && !!value)
  )

  return isHeadersEmpty(headers) ? undefined : headers
}

export const LlmSettingsPanel = () => {
  const { showToast } = useToast()
  const {
    llmProvider: initialLlmProvider,
    setLlmProvider: setLlmProvider,
    llmConfig,
    setLlmConfig
  } = useSettingsStore()
  const [llmProviderFormState, setLlmProviderFormState] = useState<LlmProvider | null>(
    initialLlmProvider
  )

  const currentLlmParams = (() => {
    if (!llmProviderFormState) return null
    return llmConfig[llmProviderFormState] as ThirdPartyLlmParams | LocalLlmParams | undefined
  })()

  const handleClearLlmConfig = () => {
    if (!llmProviderFormState) return
    trackEvent('llm-removed', {
      provider: llmProviderFormState,
      model: currentLlmParams?.model || ''
    })
    setLlmConfig(llmProviderFormState, undefined)
    setLlmProviderFormState(null)
    setLlmProvider(null)
    showToast({
      title: 'Success',
      description: 'LLM settings cleared successfully',
      variant: 'success'
    })
  }

  const handleLlmConfigFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!llmProviderFormState) return
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const apiKey = (formData.get('apiKey') || undefined) as string | undefined
    const model = (formData.get('model') || undefined) as string | undefined
    const baseUrl = (formData.get('baseUrl') || undefined) as string | undefined
    const headers = getHeadersFromFormData(formData)

    if (!model) {
      return
    }

    trackEvent(currentLlmParams ? 'llm-updated' : 'llm-added', {
      provider: llmProviderFormState,
      model
    })

    setLlmConfig(llmProviderFormState as LlmProvider, {
      apiKey,
      model,
      headers,
      baseUrl
    })
    showToast({
      title: 'Success',
      description: 'LLM settings saved successfully',
      variant: 'success'
    })
    setLlmProvider(llmProviderFormState as LlmProvider)
  }

  return (
    <div className="p-4 w-full">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label>LLM Provider</Label>
          <Select
            className="flex-1"
            placeholder="Select LLM Provider"
            selectedKey={llmProviderFormState}
            aria-label="LLM Provider"
            items={[
              { label: 'OpenAI', value: 'openai', icon: <SiOpenai /> },
              { label: 'xAI (Grok)', value: 'xai', icon: <XAI /> },
              { label: 'Anthropic', value: 'anthropic', icon: <SiAnthropic /> },
              { label: 'Google Gemini', value: 'google', icon: <SiGooglegemini /> },
              { label: 'DeepSeek', value: 'deepseek', icon: <DeepSeek /> },
              { label: 'Ollama', value: 'ollama', icon: <SiOllama /> },
              { label: 'LM Studio', value: 'lmStudio', icon: <LmStudio /> }
            ]}
            onSelectionChange={(key) => {
              if (!key) return
              setLlmProviderFormState(key as LlmProvider)
            }}
          />
        </div>
        {llmProviderFormState && (
          <Form onSubmit={handleLlmConfigFormSubmit} className="flex flex-col gap-4">
            {!isLocalLlmProvider(llmProviderFormState) && (
              <>
                <TextField
                  name="apiKey"
                  key={llmProviderFormState + 'apiKey'}
                  className="flex flex-col gap-2"
                  isRequired
                  defaultValue={currentLlmParams?.apiKey}
                  type="password"
                >
                  <Label>API Key</Label>
                  <Input placeholder="Enter LLM API Key" />
                  <FieldError />
                </TextField>
              </>
            )}
            {isLocalLlmProvider(llmProviderFormState) && (
              <>
                <TextField
                  name="baseUrl"
                  key={llmProviderFormState + 'baseUrl'}
                  className="flex flex-col gap-2"
                  defaultValue={currentLlmParams?.baseUrl}
                  validate={(value) => (isValidUrl(value, true) ? undefined : 'Invalid URL')}
                >
                  <Label>Base URL</Label>
                  <Input placeholder="Enter LLM Base URL" />
                  <FieldError />
                </TextField>
                <HeadersField
                  defaultValue={
                    isHeadersEmpty(currentLlmParams?.headers)
                      ? undefined
                      : currentLlmParams?.headers
                  }
                  key={llmProviderFormState + 'headers'}
                />
              </>
            )}
            <TextField
              name="model"
              key={llmProviderFormState + 'model'}
              className="flex flex-col gap-2"
              isRequired
              defaultValue={currentLlmParams?.model}
            >
              <Label>Model</Label>
              <Input placeholder="Enter LLM Model" />
              <FieldError />
            </TextField>
            <div className="flex flex-row gap-2 justify-end">
              <Button type="button" variant="secondary" onClick={handleClearLlmConfig}>
                Clear
              </Button>
              <Button type="submit" variant="primary">
                Save
              </Button>
            </div>
          </Form>
        )}
      </div>
    </div>
  )
}
