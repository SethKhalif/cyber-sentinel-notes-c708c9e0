

# Vistahand AI — Full Implementation Plan

## Design System
- **Dark theme by default** using the Terminal Condition palette: Midnight (#0D1117) background, Trench (#161B22) secondary, Chalk (#C9D1D9) text, Signal (#388BFD) accent, Alert (#F85149) for high threats
- **Typography**: IBM Plex Mono for all UI/body text, Inter for headings
- **Three-column persistent layout**: Navigation (240px) | Editor (flexible) | Intelligence (360px)
- No gamification, no AI icons, no WYSIWYG — Markdown-only editor
- No dashboard as landing page; after login, go straight to the most recent note

## 1. Authentication (Supabase)
- Sign up, login, password reset pages
- Profiles table (id, display_name, organization)
- Landing page for unauthenticated users (clean, dark, minimal)
- Post-login redirect to most recent note

## 2. Database (Supabase via Lovable Cloud)
- **profiles** — user_id, display_name, organization, created_at
- **notes** — id, user_id, title, content (markdown), tags (text[]), created_at, updated_at
- **threat_analysis** — id, note_id, threat_level, attack_type, probability, mitre_mapping, mitigation, created_at
- **cve_analyses** — id, user_id, cve_id, summary, exploitation_likelihood, affected_systems, mitigation, created_at
- **user_roles** — id, user_id, role (enum: admin, user, pro, enterprise) — for plan-based access control
- **subscriptions** — id, user_id, stripe_customer_id, plan, status, renewal_date
- RLS on all tables: users can only access their own data

## 3. Three-Column Layout (Core UI)
- **Column 1 — Navigation**: Note list (chronological, newest first), search bar, "Overview" link, settings/billing links
- **Column 2 — Editor**: Markdown text input with title field, tags, content body. Plain text only.
- **Column 3 — Intelligence Panel**: Read-only structured AI output (threat level, MITRE mapping, probability, mitigation). Initially blank; populates after analysis.
- Independent scrolling on columns 2 and 3

## 4. Notes System
- Create, edit, delete notes (no modals for core actions — inline in the layout)
- Tag notes with custom tags
- Search/filter notes in the navigation column
- Blank empty state with single instruction line: "Create a new note in the navigation panel."

## 5. AI Threat Analysis (Lovable AI)
- **Live Analysis**: After 3 seconds of typing inactivity, auto-trigger analysis via edge function
- Subtle Signal-blue progress bar animates across the Intelligence column top
- AI output: threat level, attack type, probability (%), MITRE ATT&CK technique, mitigation
- Only "High" threat level gets red (Alert) color; medium/low are text-only labels
- Results stored in threat_analysis table and displayed in Column 3

## 6. CVE Analyzer
- Dedicated section/mode in the editor to paste CVE data
- Edge function sends to Lovable AI, returns: vulnerability summary, exploitation likelihood, affected systems, patch guidance
- Results stored in cve_analyses table

## 7. Dashboard ("Overview")
- Accessed via navigation link (not the default landing)
- Shows: recent notes, threat insight summary, CVE analysis history, plan usage stats

## 8. Subscription System (Stripe)
- Three plans: Free (10 notes, limited AI), Pro ($15/mo, unlimited), Enterprise ($49/mo, team features)
- Stripe integration for checkout and subscription management
- Feature gating based on plan stored in subscriptions table
- Billing/settings page for managing subscription

## 9. Pages
- Landing page (unauthenticated)
- Login / Signup / Reset password
- Main workspace (three-column layout — the core experience)
- Overview (dashboard)
- Settings & Billing

## 10. Security
- RLS policies on all tables
- Notes restricted to owners
- Role-based feature access via user_roles table with security definer function
- Input validation with Zod on all forms
- Edge functions handle AI calls (no client-side API keys)

