"use client"

import * as React from "react"
import { Tldraw, useEditor, type TLStoreSnapshot, type TLUiOverrides } from "@tldraw/tldraw"
import "@tldraw/tldraw/tldraw.css"
import { useNotesStore } from "@/lib/store"
import type { Note } from "@/lib/types"

// Define the UI overrides to disable all keyboard shortcuts
const uiOverrides: TLUiOverrides = {
  keyboardShortcuts: (_editor, _shortcuts, _actions) => {
    return {} // Return an empty object to disable all shortcuts
  },
}

interface WhiteboardProps {
  note: Note
}

/**
 * A component that listens for changes in the tldraw editor
 * and persists them to the zustand store after a debounce period.
 */
function SaveStatus({ noteId }: { noteId: string }) {
  const editor = useEditor()
  const { updateNoteContent } = useNotesStore()
  const debounceTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  React.useEffect(() => {
    const handleChange = (change: any) => {
      if (change.source !== "user") return

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }

      debounceTimeoutRef.current = setTimeout(() => {
        const snapshot = editor.store.getSnapshot()
        updateNoteContent(noteId, snapshot)
      }, 500) // Debounce time of 500ms
    }

    const cleanup = editor.store.listen(handleChange, {
      source: "user",
      scope: "document",
    })

    return () => {
      cleanup()
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [editor, noteId, updateNoteContent])

  return null
}

/**
 * The main whiteboard component that wraps the Tldraw editor.
 */
export function Whiteboard({ note }: WhiteboardProps) {
  return (
    <div className="relative h-full w-full">
      <Tldraw
        // Directly pass the note's content. This was the state before the "blink fix".
        snapshot={note.content as TLStoreSnapshot}
        forceMobile={false}
        // Apply the overrides to disable keyboard shortcuts
        overrides={uiOverrides}
      >
        <SaveStatus noteId={note.id} />
      </Tldraw>
    </div>
  )
}
