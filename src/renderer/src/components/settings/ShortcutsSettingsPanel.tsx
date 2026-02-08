import { usePlatformQuery } from '@renderer/hooks/queries/usePlatformQuery'

const Key = ({ children }: { children: React.ReactNode }) => {
  return (
    <kbd className="px-2 py-1 text-xs rounded-md border border-muted bg-muted-light font-mono">
      {children}
    </kbd>
  )
}

const Combo = ({ keys }: { keys: string[] }) => {
  return (
    <div className="flex flex-row items-center gap-1 flex-wrap justify-end">
      {keys.map((k) => (
        <Key key={k}>{k}</Key>
      ))}
    </div>
  )
}

const Row = ({
  title,
  description,
  macKeys,
  winKeys
}: {
  title: string
  description?: string
  macKeys: string[]
  winKeys: string[]
}) => {
  const { data: platform } = usePlatformQuery()
  const isMac = platform === 'darwin'
  const keys = isMac ? macKeys : winKeys

  return (
    <div className="flex flex-row gap-4 items-start justify-between py-3">
      <div className="min-w-0">
        <div className="font-medium">{title}</div>
        {description && <div className="text-sm text-muted-foreground">{description}</div>}
      </div>
      <Combo keys={keys} />
    </div>
  )
}

export const ShortcutsSettingsPanel = () => {
  return (
    <div className="p-4 w-full">
      <div className="flex flex-col gap-4">
        <div className="border border-muted rounded-lg p-4 space-y-2">
          <div className="font-semibold">Main shortcuts</div>
          <div className="divide-y divide-muted">
            <Row title="Open Settings" macKeys={['⌘', ',']} winKeys={['Ctrl', ',']} />
            <Row title="Toggle Notes sidebar" macKeys={['⌘', '\\']} winKeys={['Ctrl', '\\']} />
            <Row
              title="Toggle Chat sidebar"
              macKeys={['⌘', 'Shift', '\\']}
              winKeys={['Ctrl', 'Shift', '\\']}
            />
          </div>
        </div>

        <div className="border border-muted rounded-lg p-4 space-y-2">
          <div className="font-semibold">Notes</div>
          <div className="divide-y divide-muted">
            <Row title="New note" macKeys={['⌘', 'N']} winKeys={['Ctrl', 'N']} />
            <Row
              title="New folder"
              macKeys={['⌘', 'Shift', 'N']}
              winKeys={['Ctrl', 'Shift', 'N']}
            />
            <Row
              title="Delete selected note/folder"
              description="Deletes the currently selected item in the Notes sidebar"
              macKeys={['⌘', 'Backspace']}
              winKeys={['Ctrl', 'Backspace']}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
