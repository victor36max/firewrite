import {
  Dialog,
  DialogTrigger,
  Form,
  Heading,
  Menu,
  MenuItem,
  MenuTrigger,
  Modal,
  ModalOverlay,
  Popover,
  TextField
} from 'react-aria-components'
import { LuChevronDown, LuImageOff, LuTrash, LuType } from 'react-icons/lu'
import { Button } from '@renderer/components/primitives/Button'
import { IconButton } from '@renderer/components/primitives/IconButton'
import { Input } from '@renderer/components/primitives/Input'
import { Label } from '@renderer/components/primitives/Label'
import { FieldError } from '@renderer/components/primitives/FieldError'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getNodeByKey } from 'lexical'
import { useState } from 'react'
import { cn } from '@renderer/utils'
import { $isImageNode } from './ImageNode'

type ImageComponentProps = {
  src: string
  altText: string | null
  width: number | null
  height: number | null
  nodeKey: string
}

export const ImageComponent = ({ src, altText, width, height, nodeKey }: ImageComponentProps) => {
  const [editor] = useLexicalComposerContext()
  const [isAltDialogOpen, setIsAltDialogOpen] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)

  const updateAltText = (nextAltText: string) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if (!$isImageNode(node)) return
      node.setAltText(nextAltText || null)
    })
  }

  const deleteImage = () => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      node?.remove()
    })
  }

  return (
    <div className="flex flex-col items-center group relative">
      <div className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <MenuTrigger>
          <IconButton
            aria-label="Image actions"
            Icon={LuChevronDown}
            size="sm"
            className="bg-background/90 border border-muted shadow-sm"
            onMouseDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          />
          <Popover placement="bottom end">
            <Menu className="outline-none rounded-lg border border-muted min-w-32 bg-background shadow-md">
              <MenuItem
                className={({ isHovered, isFocused }) =>
                  cn(
                    'p-2 px-3 cursor-pointer outline-none flex flex-row items-center gap-2',
                    isHovered && 'bg-muted-light',
                    isFocused && 'bg-muted-light'
                  )
                }
                onAction={() => setIsAltDialogOpen(true)}
              >
                <LuType className="w-4 h-4 text-muted-foreground" />
                Update alt text
              </MenuItem>
              <MenuItem
                className={({ isHovered, isFocused }) =>
                  cn(
                    'p-2 px-3 cursor-pointer outline-none flex flex-row items-center gap-2 text-destructive',
                    isHovered && 'bg-muted-light',
                    isFocused && 'bg-muted-light'
                  )
                }
                onAction={deleteImage}
              >
                <LuTrash className="w-4 h-4" />
                Delete image
              </MenuItem>
            </Menu>
          </Popover>
        </MenuTrigger>
      </div>
      {hasError ? (
        <div
          className="font-sans flex flex-col items-center justify-center gap-3 w-full border border-dashed border-muted rounded-lg bg-muted/30 text-muted-foreground"
          style={{
            height: height ? `${height}px` : '200px',
            maxWidth: width ? `${width}px` : '100%'
          }}
        >
          <LuImageOff className="w-6 h-6" />
          <span className="text-sm">Failed to load image</span>
          <Button
            variant="secondary"
            onPress={() => {
              setHasError(false)
              setRetryKey((k) => k + 1)
            }}
          >
            Retry
          </Button>
        </div>
      ) : (
        <img
          key={retryKey}
          src={src}
          alt={altText || ''}
          width={width ?? undefined}
          height={height ?? undefined}
          className="max-w-full h-auto"
          onError={() => setHasError(true)}
        />
      )}
      {altText && !hasError && <p className="text-sm text-muted-foreground italic">{altText}</p>}
      <DialogTrigger isOpen={isAltDialogOpen} onOpenChange={setIsAltDialogOpen}>
        <span className="hidden" />
        <ModalOverlay
          isDismissable
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
        >
          <Modal className="w-full max-w-screen-sm">
            <Dialog className="bg-background rounded-lg border border-muted outline-none">
              <div className="flex flex-row justify-between items-center p-4 border-b border-muted">
                <Heading slot="title" className="text-lg font-semibold">
                  Update alt text
                </Heading>
              </div>
              <div className="p-4 space-y-4">
                <Form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    const nextAltText = formData.get('altText')
                    if (typeof nextAltText !== 'string') {
                      return
                    }
                    updateAltText(nextAltText.trim())
                    setIsAltDialogOpen(false)
                  }}
                  className="space-y-3"
                >
                  <TextField
                    name="altText"
                    defaultValue={altText || ''}
                    className="flex flex-col gap-2"
                  >
                    <Label>Alt text</Label>
                    <Input placeholder="Describe the image" />
                    <FieldError />
                  </TextField>
                  <div className="flex flex-row justify-end gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setIsAltDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary">
                      Save
                    </Button>
                  </div>
                </Form>
              </div>
            </Dialog>
          </Modal>
        </ModalOverlay>
      </DialogTrigger>
    </div>
  )
}
