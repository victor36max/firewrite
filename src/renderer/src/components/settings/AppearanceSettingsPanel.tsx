import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { Select } from '../primitives/Select'

export const AppearanceSettingsPanel = () => {
  const queryClient = useQueryClient()
  const { data: theme } = useQuery({
    queryKey: ['theme'],
    queryFn: () => window.api.getTheme()
  })

  const { mutate: setTheme } = useMutation({
    mutationFn: window.api.setTheme,
    onSettled: () => {
      queryClient.refetchQueries({ queryKey: ['theme'] })
    }
  })

  return (
    <div className="p-4 w-full">
      <div className="flex flex-col gap-4">
        <div className="border border-muted rounded-lg p-4 space-y-4">
          <div className="font-semibold">Theme</div>
          <Select
            name="theme"
            selectedKey={theme}
            aria-label="Theme"
            onSelectionChange={(key) => {
              if (!key) return
              setTheme(key as 'system' | 'light' | 'dark')
            }}
            items={[
              { label: 'System', value: 'system' },
              { label: 'Light', value: 'light' },
              { label: 'Dark', value: 'dark' }
            ]}
          />
        </div>
      </div>
    </div>
  )
}
