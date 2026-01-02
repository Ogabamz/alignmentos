# Alignment OS Blueprint (The "To the T" Specification)

This document contains the exact technical specification for the Alignment OS project. Use this to rebuild the core logic, AI integration, and data persistence layers exactly as they exist now.

## 1. Tech Stack
- **Framework**: React (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/vite` plugin)
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini 2.0 Flash (v1beta API)

---

## 2. AI Service Layer (`services/geminiService.ts`)

**Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`
**Authentication**: Custom Header `X-goog-api-key` (Value from `import.meta.env.VITE_GEMINI_API_KEY`)

### Core Functionality:
1. **Model Discovery**: Includes a diagnostic `listAvailableModels` function to verify accessible models for the API key via `GET` to `/v1beta/models`.
2. **Context Injection**: The `getCoachAdvice` function replaces placeholders in a master prompt:
   - `{{quest}}`: Current Quarterly Quest (JSON)
   - `{{husbandTasks}}`: Last 5 Husband tasks (JSON)
   - `{{wifeTasks}}`: Last 5 Wife tasks (JSON)
   - `{{finances}}`: Last 15 Financial records (JSON)
3. **Robust Error Handling**: Explicitly logs the `AI API ERROR BODY` on any non-200 response to aid debugging.

---

## 3. Data Persistence Layer (`services/supabaseService.ts`)

**Tables Required**:
- `daily_adventures`: (id: UUID, user_id: TEXT, task: TEXT, completed: BOOLEAN, type: TEXT, date: DATE, focus_minutes: INT)
- `financials`: (id: UUID, user_id: TEXT, notes: TEXT, amount: NUMERIC, type: TEXT, category: TEXT, date: DATE)
- `quarterly_quests`: (id: UUID, quarter: TEXT, business_outcome: TEXT, revenue_target: NUMERIC, personal_outcomes: JSON, status: TEXT)
- `app_settings`: (key: TEXT PRIMARY KEY, value: TEXT)

**Service Logic**:
- Uses `@supabase/supabase-js`.
- Implements CRUD for Tasks, Financials, Quests, and Settings.
- Handles "Upsert" logic for the single-row `quarterly_quests` table.

---

## 4. State Management (`store.ts`)

- **Library**: React `useState` / `useCallback` (Custom Hook pattern).
- **Initialization**: 
  - `loadAllData`: A `Promise.all` fetch from all Supabase tables.
  - `initialLoadDone` tracking to prevent UI flickering.
- **Sync Logic**: 
  - Direct updates to Supabase on every UI action (Adding task, toggling completion, deleting).
  - Optimistic UI updates followed by state sync.

---

## 5. UI & Styling Configuration

**Vite Config (`vite.config.ts`)**:
```typescript
import tailwind from '@tailwindcss/vite';
// ...
plugins: [react(), tailwind()]
```

**Global CSS (`index.css`)**:
```css
@import "tailwindcss";
body { margin: 0; font-family: 'Inter', sans-serif; }
```

**HTML (`index.html`)**:
- No CDN scripts (Tailwind is local).
- Relative paths for assets (`/alignmentos/` base).
- Fonts: Inter via Google Fonts.

---

## 6. Deployment (`.github/workflows/deploy.yml`)

- **Target**: GitHub Pages.
- **Environment Variables**:
  - `VITE_GEMINI_API_KEY`
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- **Build Command**: `npm run build`
- **Deploy Step**: Uses `JamesIves/github-pages-deploy-action@v4` to push the `dist` folder to the `gh-pages` branch.

---

## 7. Database Policy (RLS)
Tables are configured with public access for simple hobby usage:
```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access" ON table_name FOR ALL USING (true) WITH CHECK (true);
```
