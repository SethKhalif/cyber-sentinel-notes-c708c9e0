
-- Teams table
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Team members table
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  invited_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Shared notes table (links notes to teams)
CREATE TABLE public.shared_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  shared_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(note_id, team_id)
);

ALTER TABLE public.shared_notes ENABLE ROW LEVEL SECURITY;

-- Note comments table
CREATE TABLE public.note_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.note_comments ENABLE ROW LEVEL SECURITY;

-- Helper function: check if user is a member of a team
CREATE OR REPLACE FUNCTION public.is_team_member(_user_id UUID, _team_id UUID)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE user_id = _user_id AND team_id = _team_id AND status = 'accepted'
  )
$$;

-- Helper: check if user is team owner
CREATE OR REPLACE FUNCTION public.is_team_owner(_user_id UUID, _team_id UUID)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.teams
    WHERE id = _team_id AND owner_id = _user_id
  )
$$;

-- Helper: check if note is shared with any team the user belongs to
CREATE OR REPLACE FUNCTION public.can_view_shared_note(_user_id UUID, _note_id UUID)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.shared_notes sn
    JOIN public.team_members tm ON tm.team_id = sn.team_id
    WHERE sn.note_id = _note_id
      AND tm.user_id = _user_id
      AND tm.status = 'accepted'
  )
$$;

-- RLS: teams
CREATE POLICY "Team owners can manage their teams" ON public.teams
  FOR ALL TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Team members can view their teams" ON public.teams
  FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), id));

-- RLS: team_members
CREATE POLICY "Team owners can manage members" ON public.team_members
  FOR ALL TO authenticated
  USING (public.is_team_owner(auth.uid(), team_id))
  WITH CHECK (public.is_team_owner(auth.uid(), team_id));

CREATE POLICY "Members can view team members" ON public.team_members
  FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));

CREATE POLICY "Users can update own membership" ON public.team_members
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- RLS: shared_notes
CREATE POLICY "Note owners can share their notes" ON public.shared_notes
  FOR INSERT TO authenticated
  WITH CHECK (shared_by = auth.uid());

CREATE POLICY "Note owners can unshare" ON public.shared_notes
  FOR DELETE TO authenticated
  USING (shared_by = auth.uid());

CREATE POLICY "Team members can view shared notes" ON public.shared_notes
  FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id) OR shared_by = auth.uid());

-- RLS: note_comments
CREATE POLICY "Users can comment on shared notes" ON public.note_comments
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.can_view_shared_note(auth.uid(), note_id));

CREATE POLICY "Users can view comments on shared notes" ON public.note_comments
  FOR SELECT TO authenticated
  USING (public.can_view_shared_note(auth.uid(), note_id) OR EXISTS (SELECT 1 FROM public.notes WHERE id = note_id AND user_id = auth.uid()));

CREATE POLICY "Users can delete own comments" ON public.note_comments
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Allow note owners to also view notes shared with them (add to existing notes table)
CREATE POLICY "Users can view shared notes content" ON public.notes
  FOR SELECT TO authenticated
  USING (public.can_view_shared_note(auth.uid(), id));
