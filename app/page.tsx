"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { useNotesStore } from "@/lib/store"
import { Sidebar } from "@/components/sidebar"

// Dynamically import the Whiteboard component with SSR disabled,
// as it's a client-side only component that interacts with browser APIs.
const Whiteboard = dynamic(() => import("@/components/whiteboard").then((mod) => mod.Whiteboard), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-muted">
      <p className="text-muted-foreground">Loading Whiteboard...</p>
    </div>
  ),
})

export default function HomePage() {
  // State to prevent hydration errors by ensuring client-side logic runs only after mounting.
  const [isMounted, setIsMounted] = React.useState(false)

  // Subscribe to the notes store to get the active note.
  const activeNote = useNotesStore((state) => {
    if (!state.activeNoteId) return null
    return state.notes.find((note) => note.id === state.activeNoteId) ?? null
  })

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    // Render a loading state or null on the server and during initial client render.
    return null
  }

  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      <Sidebar />
      <main className="flex-1">
        {activeNote ? (
          <Whiteboard
            key={activeNote.id} // Ensures Whiteboard re-mounts when activeNote changes
            note={activeNote}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-muted">
            <h1 className="text-2xl font-bold">No Note Selected</h1>
            <p className="text-muted-foreground">Create or select a note from the sidebar to get started.</p>
          </div>
        )}
      </main>
    </div>
  )
}
