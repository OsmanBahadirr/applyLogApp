# Code Style and Conventions

## Naming Conventions
- Components: PascalCase (e.g., `JobTracker`, `StatusBadge`)
- Functions: camelCase (e.g., `saveApplication`, `toggleStar`)
- Constants: UPPER_SNAKE_CASE (e.g., `STATUS_OPTIONS`, `WORK_TYPE_OPTIONS`)
- Types: PascalCase (e.g., `Application`, `ApplicationStatus`)
- Props: camelCase with descriptive names

## TypeScript
- All components have type definitions for props
- Use type aliases for complex types
- Export types for reuse across files
- Use `Omit` utility type for payload types

## React Patterns
- Functional components with hooks
- "use client" directive for client-side interactivity
- `useMemo` for expensive computations
- `useEffect` for side effects and event listeners
- `useRef` for DOM element references

## CSS/Tailwind
- Extensive use of CSS custom properties (CSS variables) for theming
- Tailwind utility classes for styling
- Custom colors defined in theme via CSS variables
- Responsive design with mobile-first approach (sm:, lg:, xl: breakpoints)

## Component Structure
- Components follow a single-responsibility principle
- Props interfaces defined at component level
- Event handlers defined inline or as named functions
- Conditional rendering using ternary operators or logical AND

## File Organization
- One component per file
- Related types exported from `lib/types.ts`
- Shared utilities in `lib/` directory