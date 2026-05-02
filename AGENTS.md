# JobCodex

## Commands

```bash
bun run dev          # Start development server
bun run build        # Build for production
bun run start        # Start production server
bun run lint         # Run ESLint
```

## Architecture

- **App Router**: All routes in `app/` directory with Server Components
- **Data Persistence**: `data/applications.json` (gitignored) accessed via Next.js API at `/api/applications`
- **Server-Only Code**: `lib/application-store.ts` uses `server-only` import - never import client-side
- **Types**: All TypeScript types in `lib/types.ts` (ApplicationStatus, WorkType, Application, DashboardState)

## Data Layer

API endpoints:
- `GET /api/applications` - Returns `{ applications, deletedApplications }`
- `GET /api/applications?company=X&program=Y` - Lookup existing application (case-insensitive)
- `POST /api/applications` - Create application (validates status/workType against constants)
- `PUT /api/applications` - Update full dashboard state

Application lookup normalizes whitespace and uses localeLowercase('tr-TR') for case-insensitive matching.

## Styling

- **Tailwind CSS** with `darkMode: 'class'` for theme toggling
- **Catppuccin Themes**: 'mocha', 'frappe' variants add specific classes to `html` element
- Theme persisted in localStorage as 'theme' key

## Dependencies

- `@dnd-kit/react` - Drag-and-drop for kanban board
- `@catppuccin/palette` - Color schemes

## File Ownership

- `app/api/` - Server API routes
- `app/page.tsx` - Server Component (dynamic: 'force-dynamic')
- `components/` - Client components ("use client" directive)
- `lib/` - Shared utilities and types
- `data/` - JSON data files (gitignored)