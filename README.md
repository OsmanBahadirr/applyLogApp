# JobCodex

Job application tracker built with Next.js and Tailwind CSS.

## Run

```bash
npm install
npm run dev
```

## Docker (docker-compose)

```bash
docker compose up
```

App runs at http://localhost:3000.

Data persistence uses a bind mount for `data/` so your `data/applications.json` stays on the host.

## Docker (docker run)

```bash
docker build -t lomarkomar/applylog:latest . # optional
docker run --rm -p 3000:3000 -v "applylog-data:/app/data" lomarkomar/applylog:latest
```

App runs at http://localhost:3000 and writes to `data/` on the host via the volume mount.

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
  "status": "Applied",
  "applicationDate": "2026-04-18",
  "notes": "Applied from careers page."
}
```
