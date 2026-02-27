import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { mergeRegister } from '@lexical/utils'
import { useCallback, useEffect, useState } from 'react'
import { OPEN_INSERT_IMAGE_DIALOG_COMMAND } from './image-commands'
import { $getSelection, $isRangeSelection, COMMAND_PRIORITY_HIGH } from 'lexical'
import { $createImageNode } from '../nodes/ImageNode'
import { Button } from '@renderer/components/primitives/Button'
import { Input } from '@renderer/components/primitives/Input'
import { Label } from '@renderer/components/primitives/Label'
import { FieldError } from '@renderer/components/primitives/FieldError'
import {
  Dialog,
  DialogTrigger,
  Form,
  Heading,
  Modal,
  ModalOverlay,
  TextField
} from 'react-aria-components'
import { IconButton } from '@renderer/components/primitives/IconButton'
import { LuImage, LuX } from 'react-icons/lu'

export const InsertImagePlugin = (): React.JSX.Element | null => {
  const [editor] = useLexicalComposerContext()
  const [isOpen, setIsOpen] = useState(false)

  const insertImage = useCallback(
    (url: string, altText: string | null) => {
      editor.update(() => {
        const selection = $getSelection()
        if (!selection || !$isRangeSelection(selection)) {
          return
        }
        const imageNode = $createImageNode(url, altText)
        selection.insertNodes([imageNode])
        imageNode.selectNext()
      })
    },
    [editor]
  )

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        OPEN_INSERT_IMAGE_DIALOG_COMMAND,
        () => {
          setIsOpen(true)
          return true
        },
        COMMAND_PRIORITY_HIGH
      )
    )
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
      <span className="hidden" />
      <ModalOverlay
        isDismissable
        className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
      >
        <Modal className="w-full max-w-screen-sm">
          <Dialog className="bg-background rounded-lg border border-muted outline-none">
            <div className="flex flex-row justify-between items-center p-4 border-b border-muted">
              <div className="flex flex-row items-center gap-2">
                <LuImage className="w-4 h-4 text-muted-foreground" />
                <Heading slot="title" className="text-lg font-semibold">
                  Insert image
                </Heading>
              </div>
              <IconButton slot="close" Icon={LuX} />
            </div>
            <div className="p-4 space-y-6">
              <Form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  const url = formData.get('imageUrl')
                  const alt = formData.get('altText')
                  if (typeof url !== 'string' || url.trim().length === 0) {
                    return
                  }
                  insertImage(url.trim(), typeof alt === 'string' ? alt : null)
                  setIsOpen(false)
                }}
                className="space-y-3"
              >
                <TextField name="imageUrl" isRequired className="flex flex-col gap-2">
                  <Label>Image URL</Label>
                  <Input placeholder="https://example.com/image.png" />
                  <FieldError />
                </TextField>
                <TextField name="altText" className="flex flex-col gap-2">
                  <Label>Alt text (optional)</Label>
                  <Input placeholder="Describe the image" />
                  <FieldError />
                </TextField>
                <div className="flex flex-row justify-end gap-2">
                  <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary">
                    Insert
                  </Button>
                </div>
              </Form>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  )
}
