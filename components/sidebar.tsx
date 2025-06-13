"use client"

import * as React from "react"
import { Plus, Trash2, FileText } from "lucide-react"
import { useNotesStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

/**
 * Sidebar component for navigating and managing notes.
 */
export function Sidebar() {
  const { notes, activeNoteId, addNote, deleteNote, setActiveNoteId } = useNotesStore()
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [newNoteTitle, setNewNoteTitle] = React.useState("")

  const handleAddNote = () => {
    if (newNoteTitle.trim()) {
      addNote(newNoteTitle.trim())
      setNewNoteTitle("")
      setIsAddDialogOpen(false)
    }
  }

  return (
    <>
      <aside className="flex h-full w-72 flex-col border-r bg-muted/40">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">Notes</h2>
          <Button variant="ghost" size="icon" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-5 w-5" />
            <span className="sr-only">Add Note</span>
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <nav className="p-2">
            {notes.length === 0 ? (
              <p className="p-2 text-sm text-muted-foreground">No notes yet.</p>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  className={cn(
                    "group flex cursor-pointer items-center justify-between rounded-md p-2 text-sm hover:bg-accent",
                    activeNoteId === note.id && "bg-accent",
                  )}
                  onClick={() => setActiveNoteId(note.id)}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{note.title}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteNote(note.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete Note</span>
                  </Button>
                </div>
              ))
            )}
          </nav>
        </ScrollArea>
      </aside>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a new note</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                className="col-span-3"
                onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" onClick={handleAddNote}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
