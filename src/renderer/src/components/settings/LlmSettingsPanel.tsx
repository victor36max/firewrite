import { Input } from '@renderer/components/primitives/Input'
import { Label } from '@renderer/components/primitives/Label'
import { useSettingsStore } from '@renderer/hooks/stores/useSettingsStore'
import { Select } from '@renderer/components/primitives/Select'
import { CloudLlmParams, LlmProvider } from '@renderer/services/ai'
import { SiAnthropic, SiGooglegemini, SiOpenai } from 'react-icons/si'
import { XAI, DeepSeek } from '@lobehub/icons'
import { Form, TextField } from 'react-aria-components'
import { Button } from '../primitives/Button'
import { FieldError } from '../primitives/FieldError'
import { useToast } from '@renderer/hooks/useToast'
import { useState } from 'react'

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
    if (!llmProviderFormState || !llmConfig[llmProviderFormState]) return { apiKey: '', model: '' }
    return llmConfig[llmProviderFormState] as CloudLlmParams
  })()

  const handleClearLlmConfig = () => {
    setLlmConfig(llmProviderFormState as LlmProvider, undefined)
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
    const apiKey = formData.get('apiKey')
    const model = formData.get('model')
    if (!apiKey || !model) return
    setLlmConfig(llmProviderFormState as LlmProvider, {
      apiKey: apiKey as string,
      model: model as string
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
              { label: 'DeepSeek', value: 'deepseek', icon: <DeepSeek /> }
            ]}
            onSelectionChange={(key) => {
              if (!key) return
              setLlmProviderFormState(key as LlmProvider)
            }}
          />
        </div>
        {llmProviderFormState && (
          <Form onSubmit={handleLlmConfigFormSubmit} className="flex flex-col gap-2">
            <TextField
              name="apiKey"
              key={llmProviderFormState + 'apiKey'}
              className="flex flex-col gap-2"
              isRequired
              defaultValue={currentLlmParams.apiKey}
              type="password"
            >
              <Label>API Key</Label>
              <Input placeholder="Enter LLM API Key" />
              <FieldError />
            </TextField>
            <TextField
              name="model"
              key={llmProviderFormState + 'model'}
              className="flex flex-col gap-2"
              isRequired
              defaultValue={currentLlmParams.model}
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
