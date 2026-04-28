# Project Commands

## Development
```bash
npm install          # Install dependencies
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

## File Structure
- `app/` - Next.js App Router pages and API routes
- `components/` - Reusable React components
- `lib/` - Utility functions, types, and constants
- `data/` - Application data (applications.json)

## Key Files
- `app/page.tsx` - Main page component
- `components/job-tracker.tsx` - Main dashboard component with kanban/list views
- `components/application-form.tsx` - Form for creating new applications
- `app/api/applications/route.ts` - API endpoints for CRUD operations