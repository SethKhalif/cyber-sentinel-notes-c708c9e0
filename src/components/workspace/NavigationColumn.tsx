import React from "react";
import { Link, useNavigate } from "react-router-dom";
import NotificationBell from "@/components/NotificationBell";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { Note } from "@/hooks/useNotes";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus, Search, FileText, Trash2, BarChart3, Settings, Shield, Bug, LogOut, CreditCard, Users, Sun, Moon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Props {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onDeleteNote: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isLoading: boolean;
  mode: "notes" | "cve";
  onModeChange: (m: "notes" | "cve") => void;
  searchInputRef?: React.RefObject<HTMLInputElement>;
}

const NavigationColumn: React.FC<Props> = ({
  notes, selectedNoteId, onSelectNote, onCreateNote, onDeleteNote,
  searchQuery, onSearchChange, isLoading, mode, onModeChange, searchInputRef,
}) => {
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="w-60 min-w-[240px] border-r border-border flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-sans font-bold text-sm text-foreground">Vistahand AI</span>
          </div>
          <NotificationBell />
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={toggleTheme} title="Toggle theme">
            {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notes... (⌘K)"
            className="pl-8 h-8 text-xs bg-muted border-none"
          />
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="px-3 py-2 flex gap-1">
        <Button
          variant={mode === "notes" ? "secondary" : "ghost"}
          size="sm"
          className="flex-1 text-xs h-7"
          onClick={() => onModeChange("notes")}
        >
          <FileText className="h-3 w-3 mr-1" /> Notes
        </Button>
        <Button
          variant={mode === "cve" ? "secondary" : "ghost"}
          size="sm"
          className="flex-1 text-xs h-7"
          onClick={() => onModeChange("cve")}
        >
          <Bug className="h-3 w-3 mr-1" /> CVE
        </Button>
      </div>

      {/* New Note */}
      <div className="px-3 py-1">
        <Button onClick={onCreateNote} variant="ghost" size="sm" className="w-full justify-start text-xs h-7 text-primary">
          <Plus className="h-3 w-3 mr-1" /> New Note
        </Button>
      </div>

      {/* Notes List */}
      <ScrollArea className="flex-1">
        <div className="px-2 py-1 space-y-0.5">
          {isLoading && <p className="text-xs text-muted-foreground p-3">Loading...</p>}
          {!isLoading && notes.length === 0 && (
            <p className="text-xs text-muted-foreground p-3">No notes yet.</p>
          )}
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => onSelectNote(note.id)}
              className={`group flex items-center justify-between px-2 py-2 rounded cursor-pointer text-xs transition-colors ${
                selectedNoteId === note.id
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <div className="truncate flex-1 min-w-0">
                <p className="truncate font-medium">{note.title}</p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteNote(note.id); }}
                className="opacity-0 group-hover:opacity-100 ml-1 text-muted-foreground hover:text-alert transition-opacity"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Bottom Nav */}
      <div className="border-t border-border p-2 space-y-0.5">
        <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-7" asChild>
          <Link to="/overview"><BarChart3 className="h-3 w-3 mr-2" /> Overview</Link>
        </Button>
        <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-7" asChild>
          <Link to="/settings"><Settings className="h-3 w-3 mr-2" /> Settings</Link>
        </Button>
        <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-7" asChild>
          <Link to="/team"><Users className="h-3 w-3 mr-2" /> Team</Link>
        </Button>
        <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-7" asChild>
          <Link to="/billing"><CreditCard className="h-3 w-3 mr-2" /> Billing</Link>
        </Button>
        <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-7" asChild>
          <Link to="/admin"><Shield className="h-3 w-3 mr-2" /> Admin</Link>
        </Button>
        <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-7" onClick={signOut}>
          <LogOut className="h-3 w-3 mr-2" /> Sign Out
        </Button>
      </div>
    </div>
  );
};

export default NavigationColumn;
