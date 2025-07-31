import { DBSchema, IDBPDatabase, openDB } from 'idb'

export interface Note {
  id: string
  title: string
  category?: string
  tags?: string[]
  createdAt: number
  updatedAt: number
}

export interface NoteContent {
  noteId: string
  content: string
}

interface FirewriteDB extends DBSchema {
  notes: {
    key: string
    value: Note
    indexes: {
      'by-updated': number
    }
  }
  'note-contents': {
    key: string
    value: NoteContent
  }
}

export const getDb = async (): Promise<IDBPDatabase<FirewriteDB>> => {
  return openDB<FirewriteDB>('firewrite', 1, {
    upgrade(db) {
      const notesStore = db.createObjectStore('notes', { keyPath: 'id' })
      notesStore.createIndex('by-updated', 'updatedAt')
      db.createObjectStore('note-contents', { keyPath: 'noteId' })
    }
  })
}

export const getAllNotesSortedByUpdated = async (): Promise<Note[]> => {
  const db = await getDb()
  const notes = await db.getAllFromIndex('notes', 'by-updated')
  return notes.reverse()
}

export type CreateNotePayload = Omit<Note, 'id' | 'createdAt' | 'updatedAt'> & { content: string }

export const createNote = async (payload: CreateNotePayload): Promise<string> => {
  const db = await getDb()
  const { content, ...rest } = payload

  const id = crypto.randomUUID()
  const now = Date.now()

  const note: Note = {
    ...rest,
    id,
    createdAt: now,
    updatedAt: now
  }

  // Create the note content object
  const noteContent: NoteContent = {
    noteId: id,
    content
  }

  const tx = db.transaction(['notes', 'note-contents'], 'readwrite')
  await tx.objectStore('notes').put(note)
  await tx.objectStore('note-contents').put(noteContent)
  await tx.done

  return id
}

export type UpdateNotePayload = { id: string; title?: string; content?: string }

export const updateNote = async (payload: UpdateNotePayload): Promise<void> => {
  const db = await getDb()
  const { id, title, content } = payload

  if (title === undefined && content === undefined) {
    throw new Error('No fields to update')
  }

  const note = await db.get('notes', id)
  if (!note) {
    throw new Error('Note not found')
  }

  const noteContent = await db.get('note-contents', id)
  if (!noteContent) {
    throw new Error('Note content not found')
  }

  if (title !== undefined) {
    note.title = title
  }

  if (content !== undefined) {
    noteContent.content = content
  }

  note.updatedAt = Date.now()

  const tx = db.transaction(['notes', 'note-contents'], 'readwrite')
  await tx.objectStore('notes').put(note)
  await tx.objectStore('note-contents').put(noteContent)
  await tx.done
}

export const deleteNote = async (id: string): Promise<void> => {
  const db = await getDb()
  const tx = db.transaction(['notes', 'note-contents'], 'readwrite')
  await tx.objectStore('notes').delete(id)
  await tx.objectStore('note-contents').delete(id)
  await tx.done
}

export const getNoteContent = async (noteId: string): Promise<NoteContent> => {
  const db = await getDb()
  const noteContent = await db.get('note-contents', noteId)
  if (!noteContent) {
    throw new Error('Note content not found')
  }
  return noteContent
}

export const getNote = async (noteId: string): Promise<Note> => {
  const db = await getDb()
  const note = await db.get('notes', noteId)
  if (!note) {
    throw new Error('Note not found')
  }
  return note
}
