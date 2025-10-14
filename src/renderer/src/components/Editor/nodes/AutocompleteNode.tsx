import type { DOMExportOutput, NodeKey, SerializedLexicalNode, Spread } from 'lexical'

import { DecoratorNode } from 'lexical'
import { AUTOCOMPLETE_UUID } from '../plugins/AutocompletePlugin'
import { Fragment } from 'react'

export type SerializedAutocompleteNode = Spread<
  {
    uuid: string
    text: string
  },
  SerializedLexicalNode
>

export class AutocompleteNode extends DecoratorNode<React.JSX.Element> {
  /**
   * A unique uuid is generated for each session and assigned to the instance.
   * This helps to:
   * - Ensures max one Autocomplete node per session.
   * - Ensure that when collaboration is enabled, this node is not shown in
   *   other sessions.
   * See https://github.com/facebook/lexical/blob/main/packages/lexical-playground/src/plugins/AutocompletePlugin/index.tsx
   */
  __uuid: string
  __text: string

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
      uuid: this.__uuid,
      text: this.__text
    }
  }

  constructor(text: string, uuid: string, key?: NodeKey) {
    super(key)
    this.__text = text
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

  createDOM(): HTMLElement {
    return document.createElement('span')
  }

  decorate(): React.JSX.Element {
    if (this.__uuid !== AUTOCOMPLETE_UUID) {
      return <Fragment />
    }
    return <span className="text-muted-foreground">{this.__text}</span>
  }
}

export function $createAutocompleteNode(text: string, uuid: string): AutocompleteNode {
  return new AutocompleteNode(text, uuid)
}
