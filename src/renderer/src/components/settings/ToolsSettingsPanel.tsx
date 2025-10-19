import { useSettingsStore } from '@renderer/hooks/stores/useSettingsStore'
import { Input } from '../primitives/Input'
import { Label } from '../primitives/Label'
import { useToast } from '@renderer/hooks/useToast'
import { Form, TextField } from 'react-aria-components'
import { Button } from '../primitives/Button'
import { FieldError } from '../primitives/FieldError'
import { useRerender } from '@renderer/hooks/useRerender'
import { trackEvent } from '@renderer/services/tracking'

export const ToolsSettingsPanel = () => {
  const [key, rerender] = useRerender()
  const { tavilyApiKey, setTavilyApiKey } = useSettingsStore()
  const { showToast } = useToast()
  const handleClearTavilyApiKey = () => {
    trackEvent('tool-removed', {
      tool: 'web-search',
      provider: 'tavily'
    })
    setTavilyApiKey(null)
    rerender()
    showToast({
      title: 'Success',
      description: 'Tavily API key reset successfully',
      variant: 'success'
    })
  }

  const handleTavilyApiKeyFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const apiKey = formData.get('apiKey')
    if (!apiKey) return

    trackEvent('tool-added', {
      tool: 'web-search',
      provider: 'tavily'
    })

    setTavilyApiKey(apiKey as string)
    showToast({
      title: 'Success',
      description: 'Tavily API key saved successfully',
      variant: 'success'
    })
  }

  return (
    <div className="p-4 w-full">
      <div className="flex flex-col gap-4">
        <div className="border border-muted rounded-lg p-4 space-y-4">
          <div className="font-semibold">Web Search</div>
          <Form onSubmit={handleTavilyApiKeyFormSubmit} className="flex flex-col gap-2">
            <TextField
              name="apiKey"
              defaultValue={tavilyApiKey || ''}
              key={key}
              isRequired
              type="password"
              className="flex flex-col gap-2"
            >
              <Label>Tavily API Key</Label>
              <Input />
              <FieldError />
            </TextField>
            <div className="flex flex-row gap-2 justify-end">
              <Button type="button" variant="secondary" onClick={handleClearTavilyApiKey}>
                Clear
              </Button>
              <Button type="submit" variant="primary">
                Save
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  )
}
