import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useTeams, useTeamMembers, useTeamInvitations } from "@/hooks/useTeams";
import { useSharedNotes, useNoteComments, useShareNote } from "@/hooks/useSharedNotes";
import { useNotes } from "@/hooks/useNotes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Shield, Users, Plus, Trash2, Send, ArrowLeft, Share2, MessageSquare, Check, X, FileText, Crown,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const Team = () => {
  const { user } = useAuth();
  const { plan } = useSubscription();
  const { teams, isLoading: teamsLoading, createTeam, deleteTeam } = useTeams();
  const { invitations, acceptInvitation, declineInvitation } = useTeamInvitations();
  const { notes } = useNotes();
  const { shareNote } = useShareNote();

  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [newTeamName, setNewTeamName] = useState("");
  const [showCreateTeam, setShowCreateTeam] = useState(false);

  const isEnterprise = plan === "enterprise";

  if (!isEnterprise) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <CardTitle>Team Collaboration</CardTitle>
            <CardDescription>
              Team collaboration is available on the Enterprise plan. Upgrade to invite team members, share notes, and comment on shared intelligence.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link to="/billing">Upgrade to Enterprise</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedTeam = teams.find((t) => t.id === selectedTeamId);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border px-6 py-3 flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/workspace"><ArrowLeft className="h-4 w-4 mr-1" /> Workspace</Link>
        </Button>
        <Separator orientation="vertical" className="h-5" />
        <Shield className="h-4 w-4 text-primary" />
        <span className="font-bold text-sm">Team Collaboration</span>
      </div>

      <div className="flex h-[calc(100vh-49px)]">
        {/* Teams sidebar */}
        <div className="w-64 border-r border-border flex flex-col">
          <div className="p-3 border-b border-border">
            <Button
              size="sm"
              className="w-full text-xs"
              onClick={() => setShowCreateTeam(true)}
            >
              <Plus className="h-3 w-3 mr-1" /> New Team
            </Button>
          </div>

          {/* Pending invitations */}
          {invitations.length > 0 && (
            <div className="p-3 border-b border-border">
              <p className="text-xs font-medium text-muted-foreground mb-2">Invitations</p>
              {invitations.map((inv: any) => (
                <div key={inv.id} className="flex items-center justify-between text-xs p-2 bg-muted rounded mb-1">
                  <span className="truncate">{inv.teams?.name || "Team"}</span>
                  <div className="flex gap-1">
                    <button onClick={() => acceptInvitation.mutate(inv.id)} className="text-primary hover:text-primary/80">
                      <Check className="h-3 w-3" />
                    </button>
                    <button onClick={() => declineInvitation.mutate(inv.id)} className="text-destructive hover:text-destructive/80">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-0.5">
              {teamsLoading && <p className="text-xs text-muted-foreground p-3">Loading...</p>}
              {teams.map((team) => (
                <div
                  key={team.id}
                  onClick={() => setSelectedTeamId(team.id)}
                  className={`group flex items-center justify-between px-3 py-2 rounded cursor-pointer text-xs transition-colors ${
                    selectedTeamId === team.id ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Users className="h-3 w-3 shrink-0" />
                    <span className="truncate">{team.name}</span>
                    {team.owner_id === user?.id && <Crown className="h-3 w-3 text-primary shrink-0" />}
                  </div>
                  {team.owner_id === user?.id && (
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteTeam.mutate(team.id); if (selectedTeamId === team.id) setSelectedTeamId(null); }}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Team content */}
        <div className="flex-1 overflow-hidden">
          {selectedTeam ? (
            <TeamDetail team={selectedTeam} userId={user?.id || ""} notes={notes} shareNote={shareNote} />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              Select or create a team to get started
            </div>
          )}
        </div>
      </div>

      {/* Create team dialog */}
      <Dialog open={showCreateTeam} onOpenChange={setShowCreateTeam}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Create Team</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newTeamName.trim()) {
                createTeam.mutate(newTeamName.trim());
                setNewTeamName("");
                setShowCreateTeam(false);
              }
            }}
            className="space-y-4"
          >
            <Input
              placeholder="Team name"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              autoFocus
            />
            <Button type="submit" className="w-full" disabled={!newTeamName.trim()}>
              Create
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

function TeamDetail({ team, userId, notes, shareNote }: { team: any; userId: string; notes: any[]; shareNote: any }) {
  const { members, inviteMember, removeMember } = useTeamMembers(team.id);
  const { sharedNotes } = useSharedNotes(team.id);
  const [inviteEmail, setInviteEmail] = useState("");
  const [activeTab, setActiveTab] = useState<"notes" | "members">("notes");
  const [selectedSharedNoteId, setSelectedSharedNoteId] = useState<string | null>(null);

  const isOwner = team.owner_id === userId;

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">{team.name}</h2>
            <p className="text-xs text-muted-foreground">{members.length} member(s)</p>
          </div>
          <div className="flex gap-1">
            <Button
              variant={activeTab === "notes" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("notes")}
              className="text-xs h-7"
            >
              <FileText className="h-3 w-3 mr-1" /> Shared Notes
            </Button>
            <Button
              variant={activeTab === "members" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("members")}
              className="text-xs h-7"
            >
              <Users className="h-3 w-3 mr-1" /> Members
            </Button>
          </div>
        </div>
      </div>

      {activeTab === "members" ? (
        <div className="p-4 space-y-4 overflow-auto flex-1">
          {/* Invite */}
          {isOwner && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (inviteEmail.trim()) {
                  inviteMember.mutate({ teamId: team.id, email: inviteEmail.trim() });
                  setInviteEmail("");
                }
              }}
              className="flex gap-2"
            >
              <Input
                placeholder="Invite by email..."
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="text-xs h-8"
              />
              <Button type="submit" size="sm" className="h-8 text-xs" disabled={!inviteEmail.trim()}>
                <Send className="h-3 w-3 mr-1" /> Invite
              </Button>
            </form>
          )}

          {/* Members list */}
          <div className="space-y-2">
            {members.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-2 rounded bg-muted text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[10px] font-bold">
                    {(m.invited_email || m.user_id).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span>{m.invited_email || m.user_id.slice(0, 8)}</span>
                    <Badge variant="outline" className="ml-2 text-[10px]">
                      {m.role}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={m.status === "accepted" ? "default" : "secondary"} className="text-[10px]">
                    {m.status}
                  </Badge>
                  {isOwner && m.user_id !== userId && (
                    <button onClick={() => removeMember.mutate(m.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Shared notes list */}
          <div className="w-64 border-r border-border flex flex-col">
            {/* Share a note button */}
            {isOwner && (
              <ShareNoteDialog notes={notes} teamId={team.id} shareNote={shareNote} sharedNoteIds={sharedNotes.map((sn) => sn.id)} />
            )}
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-0.5">
                {sharedNotes.length === 0 && (
                  <p className="text-xs text-muted-foreground p-3">No shared notes yet.</p>
                )}
                {sharedNotes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => setSelectedSharedNoteId(note.id)}
                    className={`px-3 py-2 rounded cursor-pointer text-xs transition-colors ${
                      selectedSharedNoteId === note.id ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    <p className="truncate font-medium">{note.title}</p>
                    <p className="text-[10px] text-muted-foreground">
                      Shared {formatDistanceToNow(new Date(note.shared_at), { addSuffix: true })}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Note content + comments */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedSharedNoteId ? (
              <SharedNoteView
                note={sharedNotes.find((n) => n.id === selectedSharedNoteId) || null}
                userId={userId}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                Select a shared note to view
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ShareNoteDialog({ notes, teamId, shareNote, sharedNoteIds }: { notes: any[]; teamId: string; shareNote: any; sharedNoteIds: string[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="p-3 border-b border-border">
          <Button size="sm" variant="outline" className="w-full text-xs h-7">
            <Share2 className="h-3 w-3 mr-1" /> Share a Note
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Share a Note</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-64">
          <div className="space-y-1">
            {notes.map((note) => (
              <button
                key={note.id}
                onClick={() => {
                  shareNote.mutate({ noteId: note.id, teamId });
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded text-xs hover:bg-muted transition-colors"
              >
                <p className="font-medium truncate">{note.title}</p>
              </button>
            ))}
            {notes.length === 0 && <p className="text-xs text-muted-foreground p-3">No notes to share.</p>}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function SharedNoteView({ note, userId }: { note: any | null; userId: string }) {
  const { comments, addComment, deleteComment } = useNoteComments(note?.id || null);
  const [newComment, setNewComment] = useState("");

  if (!note) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Note content (read-only) */}
      <div className="flex-1 overflow-auto p-6">
        <h2 className="font-bold text-xl mb-1">{note.title}</h2>
        <div className="flex gap-2 mb-4">
          {note.tags?.map((tag: string) => (
            <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
          ))}
        </div>
        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm text-foreground/90">
          {note.content || "No content."}
        </div>
      </div>

      {/* Comments section */}
      <div className="border-t border-border">
        <div className="px-4 py-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <MessageSquare className="h-3 w-3" /> Comments ({comments.length})
        </div>
        <ScrollArea className="max-h-48">
          <div className="px-4 space-y-2 pb-2">
            {comments.map((c) => (
              <div key={c.id} className="flex items-start gap-2 text-xs">
                <div className="h-5 w-5 shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[9px] font-bold mt-0.5">
                  {c.user_id.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground">{c.content}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                  </p>
                </div>
                {c.user_id === userId && (
                  <button onClick={() => deleteComment.mutate(c.id)} className="text-muted-foreground hover:text-destructive shrink-0">
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (newComment.trim() && note.id) {
              addComment.mutate({ noteId: note.id, content: newComment.trim() });
              setNewComment("");
            }
          }}
          className="px-4 pb-3 flex gap-2"
        >
          <Input
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="text-xs h-8"
          />
          <Button type="submit" size="sm" className="h-8 text-xs" disabled={!newComment.trim()}>
            <Send className="h-3 w-3" />
          </Button>
        </form>
      </div>
    </div>
  );
}

export default Team;
