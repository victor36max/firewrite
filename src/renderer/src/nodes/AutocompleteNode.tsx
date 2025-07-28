import type { DOMExportOutput, EditorConfig, NodeKey, SerializedTextNode, Spread } from 'lexical'

import { TextNode } from 'lexical'

export type SerializedAutocompleteNode = Spread<
  {
    uuid: string
  },
  SerializedTextNode
>

export class AutocompleteNode extends TextNode {
  /**
   * A unique uuid is generated for each session and assigned to the instance.
   * This helps to:
   * - Ensures max one Autocomplete node per session.
   * - Ensure that when collaboration is enabled, this node is not shown in
   *   other sessions.
   * See https://github.com/facebook/lexical/blob/main/packages/lexical-playground/src/plugins/AutocompletePlugin/index.tsx
   */
  __uuid: string

  static clone(node: AutocompleteNode): AutocompleteNode {
    return new AutocompleteNode(node.__text, node.__uuid, node.__key)
  }

  static getType(): 'autocomplete' {
    return 'autocomplete'
  }

  static importDOM(): null {
    // Never import from DOM
    return null
  }

  static importJSON(serializedNode: SerializedAutocompleteNode): AutocompleteNode {
    return $createAutocompleteNode(serializedNode.text, serializedNode.uuid).updateFromJSON(
      serializedNode
    )
  }

  exportJSON(): SerializedAutocompleteNode {
    return {
      ...super.exportJSON(),
      uuid: this.__uuid
    }
  }

  constructor(text: string, uuid: string, key?: NodeKey) {
    super(text, key)
    this.__uuid = uuid
  }

  updateDOM(): boolean {
    return false
  }

  exportDOM(): DOMExportOutput {
    return { element: null }
  }

  excludeFromCopy(): boolean {
    return true
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config)
    dom.classList.add(config.theme.autocomplete)
    return dom
  }
}

export function $createAutocompleteNode(text: string, uuid: string): AutocompleteNode {
  return new AutocompleteNode(text, uuid).setMode('token')
}
