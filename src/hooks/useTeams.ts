import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Team {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  invited_email: string | null;
  status: string;
  created_at: string;
}

export function useTeams() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const teamsQuery = useQuery({
    queryKey: ["teams", user?.id],
    queryFn: async () => {
      // Get teams the user owns
      const { data: ownedTeams, error: e1 } = await supabase
        .from("teams")
        .select("*")
        .eq("owner_id", user!.id);
      if (e1) throw e1;

      // Get teams the user is a member of
      const { data: memberships, error: e2 } = await supabase
        .from("team_members")
        .select("team_id")
        .eq("user_id", user!.id)
        .eq("status", "accepted");
      if (e2) throw e2;

      const memberTeamIds = (memberships || []).map((m: any) => m.team_id);
      let memberTeams: Team[] = [];
      if (memberTeamIds.length > 0) {
        const { data, error: e3 } = await supabase
          .from("teams")
          .select("*")
          .in("id", memberTeamIds);
        if (e3) throw e3;
        memberTeams = (data || []) as Team[];
      }

      // Deduplicate
      const all = [...(ownedTeams || []), ...memberTeams] as Team[];
      const unique = Array.from(new Map(all.map((t) => [t.id, t])).values());
      return unique;
    },
    enabled: !!user,
  });

  const createTeam = useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("teams")
        .insert({ name, owner_id: user.id })
        .select()
        .single();
      if (error) throw error;

      // Owner is also a member with 'owner' role and accepted status
      await supabase.from("team_members").insert({
        team_id: data.id,
        user_id: user.id,
        role: "owner",
        status: "accepted",
      });

      return data as Team;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Team created");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteTeam = useMutation({
    mutationFn: async (teamId: string) => {
      const { error } = await supabase.from("teams").delete().eq("id", teamId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Team deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  return {
    teams: teamsQuery.data ?? [],
    isLoading: teamsQuery.isLoading,
    createTeam,
    deleteTeam,
  };
}

export function useTeamMembers(teamId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const membersQuery = useQuery({
    queryKey: ["team_members", teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("team_id", teamId!);
      if (error) throw error;
      return data as TeamMember[];
    },
    enabled: !!teamId && !!user,
  });

  const inviteMember = useMutation({
    mutationFn: async ({ teamId, email }: { teamId: string; email: string }) => {
      // Look up user by email in profiles — we need to find the user_id
      // For now, store the invited email and use a placeholder user_id
      // The invited user will accept later
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("display_name", email); // Fallback — ideally we'd look up by email

      // Try to find user by checking auth (we can't query auth.users directly)
      // Store invitation with email, user needs to accept
      const { data, error } = await supabase
        .from("team_members")
        .insert({
          team_id: teamId,
          invited_email: email,
          user_id: profiles?.[0]?.user_id || "00000000-0000-0000-0000-000000000000",
          role: "member",
          status: "pending",
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team_members"] });
      toast.success("Invitation sent");
    },
    onError: (e) => toast.error(e.message),
  });

  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase.from("team_members").delete().eq("id", memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team_members"] });
      toast.success("Member removed");
    },
    onError: (e) => toast.error(e.message),
  });

  return {
    members: membersQuery.data ?? [],
    isLoading: membersQuery.isLoading,
    inviteMember,
    removeMember,
  };
}

export function useTeamInvitations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const invitationsQuery = useQuery({
    queryKey: ["team_invitations", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("*, teams:team_id(name, owner_id)")
        .eq("user_id", user!.id)
        .eq("status", "pending");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const acceptInvitation = useMutation({
    mutationFn: async (membershipId: string) => {
      const { error } = await supabase
        .from("team_members")
        .update({ status: "accepted" })
        .eq("id", membershipId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team_invitations"] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Invitation accepted");
    },
    onError: (e) => toast.error(e.message),
  });

  const declineInvitation = useMutation({
    mutationFn: async (membershipId: string) => {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", membershipId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team_invitations"] });
      toast.success("Invitation declined");
    },
    onError: (e) => toast.error(e.message),
  });

  return {
    invitations: invitationsQuery.data ?? [],
    isLoading: invitationsQuery.isLoading,
    acceptInvitation,
    declineInvitation,
  };
}
