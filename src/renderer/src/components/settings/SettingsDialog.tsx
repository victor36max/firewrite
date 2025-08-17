import { Settings, X } from 'lucide-react'
import { Dialog, DialogTrigger, Modal, Heading, ModalOverlay } from 'react-aria-components'
import { useSettingsStore } from '@renderer/hooks/stores/useSettingsStore'
import { IconButton } from '../primitives/IconButton'
import { Label } from '../primitives/Label'
import { Input } from '../primitives/Input'

export const SettingsDialog = () => {
  const {
    azureApiKey,
    setAzureApiKey,
    azureResourceName,
    setAzureResourceName,
    tavilyApiKey,
    setTavilyApiKey
  } = useSettingsStore()

  return (
    <DialogTrigger>
      <IconButton Icon={Settings} />
      <ModalOverlay
        isDismissable
        className="fixed inset-0 flex items-center justify-center bg-black/50"
      >
        <Modal className="w-full max-w-screen-sm">
          <Dialog className="bg-background rounded-lg border border-muted">
            <div className="flex flex-row justify-between items-center p-4 border-b border-muted">
              <Heading slot="title" className="text-lg font-semibold">
                Settings
              </Heading>
              <IconButton slot="close" Icon={X} />
            </div>
            <div className="p-4">
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
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  )
}
