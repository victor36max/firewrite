import { Select } from '../primitives/Select'
import { useSettingsStore } from '@renderer/hooks/stores/useSettingsStore'

export const EditorSettingsPanel = () => {
  const { isAutocompleteEnabled, setAutocompleteEnabled } = useSettingsStore()
  const selectedKey = isAutocompleteEnabled ? 'enabled' : 'disabled'

  return (
    <div className="p-4 w-full">
      <div className="flex flex-col gap-4">
        <div className="border border-muted rounded-lg p-4 space-y-4">
          <div className="font-semibold">Autocomplete</div>
          <div className="text-sm text-muted-foreground">
            Show inline suggestions while typing in the editor.
          </div>
          <Select
            name="autocomplete"
            selectedKey={selectedKey}
            aria-label="Autocomplete"
            onSelectionChange={(key) => {
              if (!key) return
              setAutocompleteEnabled(key === 'enabled')
            }}
            items={[
              { label: 'Enabled', value: 'enabled' },
              { label: 'Disabled', value: 'disabled' }
            ]}
          />
        </div>
      </div>
    </div>
  )
}
