import { DBSchema, IDBPDatabase, IDBPTransaction, openDB } from 'idb'

const ROOT_KEY = '__root__'

export interface Folder {
  id: string
  name: string
  parentId: string | null
  // Always a valid IndexedDB key used for indexing (since null isn't indexable).
  parentKey: string
  createdAt: number
  updatedAt: number
}

export interface Note {
  id: string
  title: string
  folderId: string | null
  // Always a valid IndexedDB key used for indexing (since null isn't indexable).
  folderKey: string
  category?: string
  tags?: string[]
  createdAt: number
  updatedAt: number
}

export interface NoteContent {
  noteId: string
  content: string
}

export interface Image {
  id: string
  noteId: string
  blob: Blob
}

interface FirewriteDB extends DBSchema {
  folders: {
    key: string
    value: Folder
    indexes: {
      'by-parent': string
      'by-updated': number
    }
  }
  notes: {
    key: string
    value: Note
    indexes: {
      'by-updated': number
      'by-folder-updated': [string, number]
    }
  }
  'note-contents': {
    key: string
    value: NoteContent
  }
  'key-value-store': {
    key: string
    value: unknown
  }
}

type FirewriteStoreName = 'folders' | 'notes' | 'note-contents' | 'key-value-store'
type FirewriteUpgradeTransaction = IDBPTransaction<
  FirewriteDB,
  FirewriteStoreName[],
  'versionchange'
>

type Migration = {
  version: number
  func: (db: IDBPDatabase<FirewriteDB>, tx: FirewriteUpgradeTransaction) => void | Promise<void>
}

const migrations: Migration[] = [
  {
    version: 2,
    func: (db) => {
      const notesStore = db.createObjectStore('notes', { keyPath: 'id' })
      notesStore.createIndex('by-updated', 'updatedAt')
      db.createObjectStore('note-contents', { keyPath: 'noteId' })
    }
  },
  {
    version: 3,
    func: (db) => {
      db.createObjectStore('key-value-store')
    }
  },
  {
    version: 4,
    func: async (db, tx) => {
      const foldersStore = db.createObjectStore('folders', { keyPath: 'id' })
      foldersStore.createIndex('by-parent', 'parentKey')
      foldersStore.createIndex('by-updated', 'updatedAt')

      // Notes: ensure final index exists
      const notesStore = tx.objectStore('notes')
      notesStore.createIndex('by-folder-updated', ['folderKey', 'updatedAt'])

      // Backfill notes to the final shape.
      let noteCursor = await notesStore.openCursor()
      while (noteCursor) {
        const note = noteCursor.value as Partial<Note> & {
          id: string
          title: string
          createdAt: number
          updatedAt: number
          folderId?: string | null
          folderKey?: string
        }

        note.folderId = null
        note.folderKey = note.folderId ?? ROOT_KEY
        await noteCursor.update(note as Note)
        noteCursor = await noteCursor.continue()
      }
    }
  }
]

export const getDb = async (): Promise<IDBPDatabase<FirewriteDB>> => {
  return openDB<FirewriteDB>('firewrite', 4, {
    async upgrade(db, oldVersion, _newVersion, transaction) {
      for (const migration of migrations) {
        if (migration.version > (oldVersion || 0)) {
          await migration.func(db, transaction)
        }
      }
    }
  })
}

export const getAllNotesSortedByUpdated = async (): Promise<Note[]> => {
  const db = await getDb()
  const notes = await db.getAllFromIndex('notes', 'by-updated')
  return notes.reverse()
}

export const getNotesByFolderSortedByUpdated = async (folderId: string | null): Promise<Note[]> => {
  const db = await getDb()
  const folderKey = folderId ?? ROOT_KEY
  const range = IDBKeyRange.bound([folderKey, 0], [folderKey, Number.MAX_SAFE_INTEGER])
  const notes = await db.getAllFromIndex('notes', 'by-folder-updated', range)
  return notes.reverse()
}

export const getAllFoldersSorted = async (): Promise<Folder[]> => {
  const db = await getDb()
  const folders = await db.getAllFromIndex('folders', 'by-updated')
  // Most-recent first; stable tie-breaker by name.
  return folders.sort((a, b) => {
    const updatedDelta = b.updatedAt - a.updatedAt
    if (updatedDelta !== 0) return updatedDelta
    return a.name.localeCompare(b.name)
  })
}

export type CreateFolderPayload = {
  name: string
  parentId: string | null
}

export const createFolder = async (payload: CreateFolderPayload): Promise<string> => {
  const db = await getDb()
  const id = crypto.randomUUID()
  const now = Date.now()
  const folder: Folder = {
    id,
    name: payload.name,
    parentId: payload.parentId ?? null,
    parentKey: payload.parentId ?? ROOT_KEY,
    createdAt: now,
    updatedAt: now
  }
  await db.put('folders', folder)
  return id
}

export type UpdateFolderPayload = {
  id: string
  name?: string
  parentId?: string | null
}

export const updateFolder = async (payload: UpdateFolderPayload): Promise<void> => {
  const db = await getDb()
  const folder = await db.get('folders', payload.id)
  if (!folder) {
    throw new Error('Folder not found')
  }

  if (payload.name !== undefined) folder.name = payload.name
  if (payload.parentId !== undefined) {
    folder.parentId = payload.parentId ?? null
    folder.parentKey = folder.parentId ?? ROOT_KEY
  }
  folder.updatedAt = Date.now()
  await db.put('folders', folder)
}

export const getFolder = async (
  folderId: string | null
): Promise<{ folder: Folder | null; subfolders: Folder[]; notes: Note[] }> => {
  const db = await getDb()
  const tx = db.transaction(['folders', 'notes'], 'readonly')

  const foldersStore = tx.objectStore('folders')
  const foldersByParent = foldersStore.index('by-parent')
  const notesByFolderUpdated = tx.objectStore('notes').index('by-folder-updated')

  const folder = folderId ? ((await foldersStore.get(folderId)) ?? null) : null
  if (folderId && !folder) {
    throw new Error('Folder not found')
  }

  // Direct subfolders (not recursive)
  const subfolders = (await foldersByParent.getAll(folderId ?? ROOT_KEY)) as Folder[]

  // Direct notes (not recursive), sorted by updated desc because we reverse the index order later if needed.
  const folderKey = folderId ?? ROOT_KEY
  const range = IDBKeyRange.bound([folderKey, 0], [folderKey, Number.MAX_SAFE_INTEGER])
  const notes = (await notesByFolderUpdated.getAll(range)) as Note[]
  notes.reverse()

  await tx.done
  return { folder, subfolders, notes }
}

export const getFolderDeleteStats = async (
  folderId: string
): Promise<{ folderName: string; noteCount: number; folderCount: number }> => {
  const db = await getDb()
  const tx = db.transaction(['folders', 'notes'], 'readonly')
  const foldersStore = tx.objectStore('folders')
  const notesByFolderUpdated = tx.objectStore('notes').index('by-folder-updated')
  const foldersByParent = foldersStore.index('by-parent')

  const folder = await foldersStore.get(folderId)
  if (!folder) {
    throw new Error('Folder not found')
  }

  let noteCount = 0
  let folderCount = 0

  const stack: string[] = [folderId]
  const visited = new Set<string>()

  while (stack.length) {
    const cur = stack.pop() as string
    if (visited.has(cur)) continue
    visited.add(cur)

    // Notes in this folder (indexed count)
    const range = IDBKeyRange.bound([cur, 0], [cur, Number.MAX_SAFE_INTEGER])
    noteCount += await notesByFolderUpdated.count(range)

    // Child folders (indexed lookup)
    const childIds = (await foldersByParent.getAllKeys(cur)) as string[]
    folderCount += childIds.length
    for (const childId of childIds) stack.push(childId)
  }

  await tx.done
  return { folderName: folder.name, noteCount, folderCount }
}

export const getNoteCount = async (): Promise<number> => {
  const db = await getDb()
  return await db.count('notes')
}

const touchFolderAndAncestors = async (
  folderId: string | null,
  tx: IDBPTransaction<FirewriteDB, FirewriteStoreName[], 'readwrite'>,
  now: number
): Promise<void> => {
  let cur: string | null = folderId ?? null
  while (cur) {
    const folder = await tx.objectStore('folders').get(cur)
    if (!folder) break
    if (folder.updatedAt !== now) {
      folder.updatedAt = now
      await tx.objectStore('folders').put(folder)
    }
    cur = folder.parentId
  }
}

// Note: deletion semantics (what happens to child folders/notes) can vary; leaving this out for now.

export type CreateNotePayload = Omit<
  Note,
  'id' | 'createdAt' | 'updatedAt' | 'folderId' | 'folderKey'
> & {
  content: string
  folderId?: string | null
}

export const createNote = async (payload: CreateNotePayload): Promise<string> => {
  const db = await getDb()
  const { content, folderId, ...rest } = payload

  const id = crypto.randomUUID()
  const now = Date.now()

  const note: Note = {
    ...rest,
    id,
    folderId: folderId ?? null,
    folderKey: folderId ?? ROOT_KEY,
    createdAt: now,
    updatedAt: now
  }

  // Create the note content object
  const noteContent: NoteContent = {
    noteId: id,
    content
  }

  const tx = db.transaction(['folders', 'notes', 'note-contents'], 'readwrite')
  await tx.objectStore('notes').put(note)
  await tx.objectStore('note-contents').put(noteContent)
  await touchFolderAndAncestors(note.folderId, tx, now)
  await tx.done

  return id
}

export type UpdateNotePayload = {
  id: string
  title?: string
  content?: string
  folderId?: string | null
}

export const updateNote = async (payload: UpdateNotePayload): Promise<void> => {
  const db = await getDb()
  const { id, title, content, folderId } = payload

  if (title === undefined && content === undefined && folderId === undefined) {
    throw new Error('No fields to update')
  }

  const tx = db.transaction(['folders', 'notes', 'note-contents'], 'readwrite')
  const note = await tx.objectStore('notes').get(id)
  if (!note) {
    throw new Error('Note not found')
  }

  const noteContent = await tx.objectStore('note-contents').get(id)
  if (!noteContent) {
    throw new Error('Note content not found')
  }

  if (title !== undefined) {
    note.title = title
  }

  if (content !== undefined) {
    noteContent.content = content
  }

  const oldFolderId = note.folderId
  if (folderId !== undefined) {
    note.folderId = folderId
    note.folderKey = folderId ?? ROOT_KEY
  }

  const now = Date.now()
  note.updatedAt = now

  await tx.objectStore('notes').put(note)
  await tx.objectStore('note-contents').put(noteContent)
  // Touch destination folder chain; also touch old chain if the note was moved.
  await touchFolderAndAncestors(note.folderId, tx, now)
  if (oldFolderId !== note.folderId) {
    await touchFolderAndAncestors(oldFolderId, tx, now)
  }
  await tx.done
}

export const deleteNote = async (id: string) => {
  const db = await getDb()
  const tx = db.transaction(['notes', 'note-contents'], 'readwrite')
  await tx.objectStore('notes').delete(id)
  await tx.objectStore('note-contents').delete(id)
  await tx.done
  return id
}

export const deleteFolder = async (folderId: string): Promise<string> => {
  const db = await getDb()
  const tx = db.transaction(['folders', 'notes', 'note-contents'], 'readwrite')

  // Load all folders and compute descendant set
  const allFolders = await tx.objectStore('folders').getAll()
  const childrenByParent = new Map<string | null, string[]>()
  for (const f of allFolders) {
    const parent = f.parentId
    const arr = childrenByParent.get(parent) || []
    arr.push(f.id)
    childrenByParent.set(parent, arr)
  }

  const folderIdsToDelete = new Set<string>()
  const stack: string[] = [folderId]
  while (stack.length) {
    const cur = stack.pop() as string
    if (folderIdsToDelete.has(cur)) continue
    folderIdsToDelete.add(cur)
    const children = childrenByParent.get(cur) || []
    for (const childId of children) stack.push(childId)
  }

  // Delete notes (and contents) in any of these folders
  const notesStore = tx.objectStore('notes')
  let cursor = await notesStore.openCursor()
  while (cursor) {
    const note = cursor.value as Note
    if (note.folderId && folderIdsToDelete.has(note.folderId)) {
      await tx.objectStore('note-contents').delete(note.id)
      await cursor.delete()
    }
    cursor = await cursor.continue()
  }

  // Delete folders (children first doesn't matter in IDB, but keep deterministic)
  for (const id of folderIdsToDelete) {
    await tx.objectStore('folders').delete(id)
  }

  await tx.done
  return folderId
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

const getValueFromKeyValueStore = async <T>(key: string): Promise<T | null> => {
  const db = await getDb()
  const value = await db.get('key-value-store', key)
  return (value as T) || null
}

const setValueToKeyValueStore = async (key: string, value: unknown) => {
  const db = await getDb()
  await db.put('key-value-store', value, key)
}

const deleteValueFromKeyValueStore = async (key: string) => {
  const db = await getDb()
  await db.delete('key-value-store', key)
}

export const keyValueStore = {
  getItem: getValueFromKeyValueStore,
  setItem: setValueToKeyValueStore,
  removeItem: deleteValueFromKeyValueStore
}

export const encryptedKeyValueStore = {
  getItem: async (key) => {
    const encryptedValue = await getValueFromKeyValueStore<string>(key)
    if (!encryptedValue) {
      return null
    }
    return window.api.decryptString(encryptedValue)
  },
  setItem: async (key, value) => {
    const encryptedValue = await window.api.encryptString(value)
    await setValueToKeyValueStore(key, encryptedValue)
  },
  removeItem: async (key) => {
    await deleteValueFromKeyValueStore(key)
  }
}
