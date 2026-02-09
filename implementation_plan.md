# Icarus Canvas - Implementation Plan

## Overview
This plan details the transformation of the "Atlas Canvas" prototype into "Icarus Canvas" - a fully functional Visual OSINT Intelligence Workspace. The project combines an infinite canvas (tldraw) with automated OSINT capabilities (Python/FastAPI) and semantic search.

## Phase 1: Rebranding & Setup (Done)
- [x] Rename project to `icarus-osint-canvas` in `package.json`.
- [x] Update `index.html` title (Already "Icarus Canvas — OSINT Intelligence Workspace").
- [ ] Install frontend dependencies (`npm install` running).

## Phase 2: Backend Architecture (New)
To support real "Automated dark-web/surface-web intelligence", a dedicated backend is required.

### 2.1 Backend Setup
- [ ] Create `backend/` directory.
- [ ] Initialize Python environment (`venv`).
- [ ] Install dependencies: `fastapi` `uvicorn` `pydantic` `requests` `beautifulsoup4` `duckduckgo-search` (free search API).
- [ ] Create `backend/main.py`: FastAPI server.

### 2.2 OSINT Integration (Robin OSINT Logic)
- [ ] Create `backend/osint_engine.py`.
- [ ] Implement `scan_entity(query, entity_type)` function.
    - **Email**: Check known breaches (e.g. mock or free API), search social media mentions.
    - **Username**: Search cross-platform availability.
    - **IP**: Geolocation lookup.
    - **Domain**: WHOIS/DNS lookup.
- [ ] Create API Endpoint: `POST /api/scan`.

### 2.3 Semantic Search
- [ ] Integrate a light-weight vector store (e.g. ChromaDB or just local embedding match if simple).
- [ ] Allow searching previous investigation nodes by meaning, not just exact text.

## Phase 3: Frontend Integration
- [ ] Update `src/components/canvas/AnalystPanel.tsx` to call local backend (`http://localhost:8000/api/scan`) instead of Supabase Edge Function (`supabase.functions.invoke`).
- [ ] Update `src/integrations/supabase/client.ts` or add a new `api.ts` service for backend communication.
- [ ] Ensure `IntelNodeShape` correctly renders backend data.

## Phase 4: UI/UX "Seamless & Gorgeous" Polish
- [ ] Review current animations and styling.
- [ ] Enhance "Deep Dive" panel with rich data visualization (graphs/charts for OSINT data).
- [ ] Use `shadcn/ui` components for all inputs and dialogs.

## Phase 5: Documentation & Deployment
- [ ] Update `README.md` with "Icarus Canvas" branding and setup instructions.
- [ ] Create scripts to run both frontend and backend (`npm run dev:all`).
