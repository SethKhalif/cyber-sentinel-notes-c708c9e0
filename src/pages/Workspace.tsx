import { useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotes, Note } from "@/hooks/useNotes";
import { useThreatAnalysis, ThreatAnalysis } from "@/hooks/useThreatAnalysis";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { PLANS } from "@/lib/plans";
import NavigationColumn from "@/components/workspace/NavigationColumn";
import EditorColumn from "@/components/workspace/EditorColumn";
import IntelligencePanel from "@/components/workspace/IntelligencePanel";
import { toast } from "sonner";

const Workspace = () => {
  const { user } = useAuth();
  const { notes, isLoading, createNote, updateNote, deleteNote } = useNotes();
  const { analyze, getAnalysis, analyzing } = useThreatAnalysis();
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentAnalysis, setCurrentAnalysis] = useState<ThreatAnalysis | null>(null);
  const [mode, setMode] = useState<"notes" | "cve">("notes");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useKeyboardShortcuts({
    onCreateNote: () => handleCreateNote(),
    onToggleMode: () => setMode((m) => (m === "notes" ? "cve" : "notes")),
    onSearch: () => searchInputRef.current?.focus(),
  });

  const selectedNote = notes.find((n) => n.id === selectedNoteId) ?? null;

  // Auto-select first note
  useEffect(() => {
    if (!selectedNoteId && notes.length > 0) {
      setSelectedNoteId(notes[0].id);
    }
  }, [notes, selectedNoteId]);

  // Load analysis when note is selected
  useEffect(() => {
    if (selectedNoteId) {
      getAnalysis(selectedNoteId).then(setCurrentAnalysis);
    } else {
      setCurrentAnalysis(null);
    }
  }, [selectedNoteId]);

  const { plan } = useSubscription();
  const currentPlan = PLANS[plan];

  const handleCreateNote = async () => {
    if (notes.length >= currentPlan.notesLimit) {
      toast.error(`Free plan limited to ${currentPlan.notesLimit} notes. Upgrade to Pro for unlimited notes.`);
      return;
    }
    const note = await createNote.mutateAsync();
    setSelectedNoteId(note.id);
    setMode("notes");
  };

  const handleUpdateNote = useCallback(
    (id: string, updates: Partial<Note>) => {
      updateNote.mutate({ id, ...updates });

      // Debounced AI analysis on content change
      if (updates.content !== undefined) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
          const result = await analyze(id, updates.content || "");
          if (result) {
            getAnalysis(id).then(setCurrentAnalysis);
          }
        }, 3000);
      }
    },
    [updateNote, analyze, getAnalysis]
  );

  const handleDeleteNote = (id: string) => {
    deleteNote.mutate(id);
    if (selectedNoteId === id) {
      setSelectedNoteId(null);
      setCurrentAnalysis(null);
    }
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.content && n.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (n.tags && n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <NavigationColumn
        notes={filteredNotes}
        selectedNoteId={selectedNoteId}
        onSelectNote={(id) => { setSelectedNoteId(id); setMode("notes"); }}
        onCreateNote={handleCreateNote}
        onDeleteNote={handleDeleteNote}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isLoading={isLoading}
        mode={mode}
        onModeChange={setMode}
        searchInputRef={searchInputRef}
      />
      />
      <EditorColumn
        note={selectedNote}
        onUpdate={handleUpdateNote}
        mode={mode}
      />
      <IntelligencePanel
        analysis={currentAnalysis}
        analyzing={analyzing}
        mode={mode}
        noteId={selectedNoteId}
      />
    </div>
  );
};

export default Workspace;
