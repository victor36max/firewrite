import { twMerge } from 'tailwind-merge'
import { ClassValue, clsx } from 'clsx'
import { SerializedEditorState, SerializedLexicalNode } from 'lexical'

export const cn = (...classes: ClassValue[]): string => {
  return twMerge(clsx(classes))
}

export const isValidUrl = (url: string, insecure: boolean = false): boolean => {
  const regexString = `^(https${insecure ? '?' : ''}:\\/\\/)(?:localhost|(?:(?:25[0-5]|2[0-4]\\d|1?\\d?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1?\\d?\\d)){3})|(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+))(?::\\d{2,5})?(?:[/?#][^\\s]*)?$`
  const regex = new RegExp(regexString, 'i')
  return regex.test(url)
}

export const removeAutocompleteNodes = (
  serializedNodeState: SerializedEditorState
): SerializedEditorState => {
  const removeAutocompleteChildren = (node: SerializedLexicalNode) => {
    if (node.type === 'autocomplete') {
      return null
    }

    if ('children' in node && Array.isArray(node.children)) {
      return {
        ...node,
        children: node.children
          .map(removeAutocompleteChildren)
          .filter((child): child is SerializedLexicalNode => child !== null)
      }
    }

    return node
  }

  return {
    ...serializedNodeState,
    root: removeAutocompleteChildren(serializedNodeState.root)
  }
}

export const isElectron = () => {
  return window.api !== undefined && window.electron !== undefined
}

export const dictionaryToXmlString = (obj: Record<string, string | null>) => {
  return Object.entries(obj)
    .flatMap(([key, value]) => (value ? [`<${key}>${value}</${key}>`] : []))
    .join('\n')
}

export const isDev = () => {
  return import.meta.env.DEV
}
