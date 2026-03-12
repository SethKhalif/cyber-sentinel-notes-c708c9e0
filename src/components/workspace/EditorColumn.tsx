import React, { useState, useEffect, useCallback } from "react";
import { Note } from "@/hooks/useNotes";
import { useCveAnalysis } from "@/hooks/useCveAnalysis";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Plus, Bug, Loader2 } from "lucide-react";

interface Props {
  note: Note | null;
  onUpdate: (id: string, updates: Partial<Note>) => void;
  mode: "notes" | "cve" | "scanner";
}

const EditorColumn: React.FC<Props> = ({ note, onUpdate, mode }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [cveInput, setCveInput] = useState("");
  const { analyzeCve, result: cveResult, analyzing: cveAnalyzing } = useCveAnalysis();

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content || "");
      setTags(note.tags || []);
    }
  }, [note?.id]);

  const handleTitleChange = useCallback(
    (val: string) => {
      setTitle(val);
      if (note) onUpdate(note.id, { title: val });
    },
    [note, onUpdate]
  );

  const handleContentChange = useCallback(
    (val: string) => {
      setContent(val);
      if (note) onUpdate(note.id, { content: val });
    },
    [note, onUpdate]
  );

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && note && !tags.includes(t)) {
      const newTags = [...tags, t];
      setTags(newTags);
      setTagInput("");
      onUpdate(note.id, { tags: newTags });
    }
  };

  const removeTag = (tag: string) => {
    if (note) {
      const newTags = tags.filter((t) => t !== tag);
      setTags(newTags);
      onUpdate(note.id, { tags: newTags });
    }
  };

  if (mode === "cve") {
    return (
      <div className="flex-1 flex flex-col border-r border-border bg-background">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Bug className="h-4 w-4 text-primary" />
            <h2 className="font-sans font-semibold text-foreground text-sm">CVE Analyzer</h2>
          </div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          <p className="text-xs text-muted-foreground">
            Paste a CVE ID or vulnerability description below for AI analysis.
          </p>
          <Textarea
            value={cveInput}
            onChange={(e) => setCveInput(e.target.value)}
            placeholder="CVE-2024-1234 or paste vulnerability details..."
            className="min-h-[200px] bg-muted border-none text-sm font-mono resize-none"
          />
          <Button
            onClick={() => analyzeCve(cveInput)}
            disabled={cveAnalyzing || !cveInput.trim()}
            size="sm"
          >
            {cveAnalyzing ? (
              <><Loader2 className="h-3 w-3 mr-2 animate-spin" /> Analyzing...</>
            ) : (
              "Analyze CVE"
            )}
          </Button>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center border-r border-border bg-background">
        <p className="text-sm text-muted-foreground">Create a new note in the navigation panel.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col border-r border-border bg-background">
      {/* Title */}
      <div className="p-4 border-b border-border">
        <Input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Note title"
          className="border-none bg-transparent text-lg font-sans font-semibold text-foreground p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>

      {/* Tags */}
      <div className="px-4 py-2 border-b border-border flex flex-wrap items-center gap-1.5">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="text-[10px] h-5 gap-1">
            {tag}
            <button onClick={() => removeTag(tag)}>
              <X className="h-2.5 w-2.5" />
            </button>
          </Badge>
        ))}
        <div className="flex items-center gap-1">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
            placeholder="Add tag..."
            className="border-none bg-transparent text-[10px] h-5 w-20 p-0 focus-visible:ring-0"
          />
          {tagInput && (
            <button onClick={addTag}>
              <Plus className="h-3 w-3 text-primary" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-auto">
        <Textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Write your cybersecurity notes in markdown..."
          className="w-full h-full min-h-[calc(100vh-200px)] border-none bg-transparent text-sm font-mono resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
    </div>
  );
};

export default EditorColumn;
