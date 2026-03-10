import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Note } from "@/hooks/useNotes";

export interface NoteComment {
  id: string;
  note_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export function useSharedNotes(teamId: string | null) {
  const { user } = useAuth();

  const sharedNotesQuery = useQuery({
    queryKey: ["shared_notes", teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shared_notes")
        .select("*, notes:note_id(*)")
        .eq("team_id", teamId!);
      if (error) throw error;
      return data.map((sn: any) => ({
        ...sn.notes,
        shared_by: sn.shared_by,
        shared_at: sn.created_at,
        shared_note_id: sn.id,
      })) as (Note & { shared_by: string; shared_at: string; shared_note_id: string })[];
    },
    enabled: !!teamId && !!user,
  });

  return {
    sharedNotes: sharedNotesQuery.data ?? [],
    isLoading: sharedNotesQuery.isLoading,
  };
}

export function useShareNote() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const shareNote = useMutation({
    mutationFn: async ({ noteId, teamId }: { noteId: string; teamId: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("shared_notes").insert({
        note_id: noteId,
        team_id: teamId,
        shared_by: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shared_notes"] });
      toast.success("Note shared with team");
    },
    onError: (e) => toast.error(e.message),
  });

  const unshareNote = useMutation({
    mutationFn: async (sharedNoteId: string) => {
      const { error } = await supabase.from("shared_notes").delete().eq("id", sharedNoteId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shared_notes"] });
      toast.success("Note unshared");
    },
    onError: (e) => toast.error(e.message),
  });

  return { shareNote, unshareNote };
}

export function useNoteComments(noteId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const commentsQuery = useQuery({
    queryKey: ["note_comments", noteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("note_comments")
        .select("*")
        .eq("note_id", noteId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as NoteComment[];
    },
    enabled: !!noteId && !!user,
  });

  const addComment = useMutation({
    mutationFn: async ({ noteId, content }: { noteId: string; content: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("note_comments").insert({
        note_id: noteId,
        user_id: user.id,
        content,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["note_comments"] });
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase.from("note_comments").delete().eq("id", commentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["note_comments"] });
    },
    onError: (e) => toast.error(e.message),
  });

  return {
    comments: commentsQuery.data ?? [],
    isLoading: commentsQuery.isLoading,
    addComment,
    deleteComment,
  };
}
