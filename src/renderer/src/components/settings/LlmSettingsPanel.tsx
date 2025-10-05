import { Input } from '@renderer/components/primitives/Input'
import { Label } from '@renderer/components/primitives/Label'
import { useSettingsStore } from '@renderer/hooks/stores/useSettingsStore'

export const LlmSettingsPanel = () => {
  const {
    azureApiKey,
    setAzureApiKey,
    azureResourceName,
    setAzureResourceName,
    tavilyApiKey,
    setTavilyApiKey
  } = useSettingsStore()

  return (
    <div className="p-4 w-full">
      <div className="flex flex-col gap-4">
        <div className="flex flex-row gap-2 items-center">
          <Label>Azure API Key</Label>
          <Input
            className="flex-1 p-2 border border-muted rounded-md"
            type="password"
            value={azureApiKey || ''}
            onChange={(e) => setAzureApiKey(e.target.value)}
          />
        </div>
        <div className="flex flex-row gap-2 items-center">
          <Label>Azure Resource Name</Label>
          <Input
            className="flex-1 p-2 border border-muted rounded-md"
            value={azureResourceName || ''}
            onChange={(e) => setAzureResourceName(e.target.value)}
          />
        </div>
        <div className="flex flex-row gap-2 items-center">
          <Label>Tavily API Key</Label>
          <Input
            className="flex-1 p-2 border border-muted rounded-md"
            type="password"
            value={tavilyApiKey || ''}
            onChange={(e) => setTavilyApiKey(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
