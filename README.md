# JobCodex

Job application tracker built with Next.js and Tailwind CSS.

## Run

```bash
npm install
npm run dev
```

## Notes

The app reads and writes `data/applications.json` through a Next.js API route.

## API

Create an application:

```bash
POST /api/applications
Content-Type: application/json

{
  "company": "Example Inc.",
  "program": "Frontend Developer",
  "workType": "Full-time",
  "status": "Submitted",
  "applicationDate": "2026-04-18",
  "notes": "Submitted from careers page."
}
```
