# CNU Free Backend (`[BE-01]`, `[BE-02]`, `[BE-03]`)

Foundational Node.js + TypeScript + Express + Supabase API workspace for CNU Free.

## Setup

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Create `backend/.env` from `backend/.env.example`:
   ```bash
   cp .env.example .env
   ```
   Fill in your Supabase Cloud credentials from **Project Settings -> API**:
   - `SUPABASE_PROJECT_ID`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

3. Deploy SQL migrations to Supabase Cloud (no local Docker required):
   ```bash
   npx supabase login
   npx supabase link --project-ref <SUPABASE_PROJECT_ID>
   npx supabase db push
   ```
   *(Alternatively, paste `supabase/migrations/20261123000100_init_core_schema.sql` and `20261123000200_auth_profile_trigger.sql` into the Supabase SQL Editor in timestamp order.)*

4. Regenerate TypeScript database types from the live project:
   ```bash
   npm run db:types
   ```

5. Start the Express dev server:
   ```bash
   npm run dev
   ```

## RLS Note (`[BE-09]`)

Row-Level Security (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`) is intentionally left disabled in `[BE-02]` so `[BE-04]` through `[BE-08]` developers are not blocked before `[BE-09]` adds all RLS policies. Use `req.supabase` (from `requireAuth`) on user-scoped routes so `[BE-09]` policies apply automatically once enabled.
