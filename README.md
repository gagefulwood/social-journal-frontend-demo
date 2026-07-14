# Social Journal - Frontend

Next.js App Router frontend for the private Social Journal relationship journal.

See the canonical frontend [design system](DESIGN_SYSTEM.md) for shared visual,
component, and composition guidance.

## Prerequisites

- Node.js 20.9 or newer
- npm
- The Social Journal backend running locally

## Setup

Install the locked dependencies:

```bash
npm ci
```

Create a local `.env` file (it is ignored by Git):

```text
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the frontend:

```bash
npm run dev
```

Open `http://localhost:3000`. The browser sends authenticated API requests to
the configured backend URL with credentials enabled.

## Checks

```bash
npm run lint
npm run build
```

There is currently no automated test script in `package.json`. `npm run build`
performs the production compile and TypeScript check.

## Available Scripts

- `npm run dev` starts the development server.
- `npm run build` creates a production build.
- `npm run start` serves an existing production build.
- `npm run lint` runs ESLint.
