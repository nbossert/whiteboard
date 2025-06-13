import type { TLStoreSnapshot } from "@tldraw/tldraw"

/**
 * Defines the data structure for a single note.
 */
export interface Note {
  id: string // uuid
  title: string
  createdAt: string // ISO date string
  updatedAt: string // ISO date string
  content: TLStoreSnapshot // tldraw JSON snapshot
}
