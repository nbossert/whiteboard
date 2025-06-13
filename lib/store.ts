import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import localforage from "localforage"
import type { Note } from "./types"
import type { TLStoreSnapshot } from "@tldraw/tldraw"

// Configure localforage for better async storage handling
localforage.config({
  name: "whiteboard-notes-app",
  storeName: "notes_storage",
})

// Canonical Empty Tldraw Snapshot for new notes
const EMPTY_TLDRAW_SNAPSHOT_FOR_NEW_NOTES: TLStoreSnapshot = {
  store: {},
  schema: {
    schemaVersion: 1,
    storeVersion: 4,
    recordVersions: {
      asset: { version: 1, subTypeKey: "type", subTypeVersions: { image: 2, video: 2, gif: 2, bookmark: 1 } },
      camera: { version: 1 },
      document: { version: 2 },
      instance: { version: 22 },
      instance_page_state: { version: 5 },
      page: { version: 1 },
      shape: {
        version: 3,
        subTypeKey: "type",
        subTypeVersions: {
          group: 0,
          text: 1,
          bookmark: 1,
          draw: 1,
          geo: 7,
          note: 4,
          line: 1,
          frame: 0,
          arrow: 1,
          highlight: 0,
          embed: 4,
          image: 2,
          video: 1,
        },
      },
      instance_presence: { version: 5 },
      pointer: { version: 1 },
    },
  },
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: [],
      activeNoteId: null,

      addNote: (title) => {
        const newNote: Note = {
          id: crypto.randomUUID(),
          title,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          content: EMPTY_TLDRAW_SNAPSHOT_FOR_NEW_NOTES, // Use the defined empty snapshot
        }
        set((state) => ({
          notes: [...state.notes, newNote],
          activeNoteId: newNote.id,
        }))
      },

      deleteNote: (id) => {
        set((state) => {
          const newNotes = state.notes.filter((note) => note.id !== id)
          let newActiveNoteId = state.activeNoteId
          if (state.activeNoteId === id) {
            newActiveNoteId = newNotes.length > 0 ? newNotes[0].id : null
          }
          return { notes: newNotes, activeNoteId: newActiveNoteId }
        })
      },

      updateNoteContent: (id, content) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, content, updatedAt: new Date().toISOString() } : note,
          ),
        }))
      },

      setActiveNoteId: (id) => {
        set({ activeNoteId: id })
      },
    }),
    {
      name: "notes-storage", // unique name
      storage: createJSONStorage(() => localforage),
      onRehydrateStorage: () => (state) => {
        if (state && state.notes.length > 0 && !state.activeNoteId) {
          state.activeNoteId = state.notes[0].id
        }
        // Ensure all rehydrated notes have valid content
        if (state && state.notes) {
          state.notes = state.notes.map((note) => {
            if (
              !note.content ||
              typeof note.content !== "object" ||
              !Object.prototype.hasOwnProperty.call(note.content, "store") ||
              !Object.prototype.hasOwnProperty.call(note.content, "schema")
            ) {
              console.warn(`Rehydrated note "${note.title}" (ID: ${note.id}) had invalid content. Resetting to empty.`)
              return { ...note, content: EMPTY_TLDRAW_SNAPSHOT_FOR_NEW_NOTES }
            }
            return note
          })
        }
      },
    },
  ),
)

interface NotesState {
  notes: Note[]
  activeNoteId: string | null
  addNote: (title: string) => void
  deleteNote: (id: string) => void
  updateNoteContent: (id: string, content: TLStoreSnapshot) => void
  setActiveNoteId: (id: string | null) => void
}
