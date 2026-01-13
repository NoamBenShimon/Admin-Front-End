# Motzklist Admin Panel

Admin dashboard for the Motzklist platform. Built with Next.js, React, TypeScript, and Tailwind CSS.

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment (copy and edit)
cp .env.local.example .env.local

# Start development server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Environment Configuration

Create `.env.local` with:

```env
API_URL=http://localhost:8080        # Backend API (server-side only)
NEXT_PUBLIC_API_URL=/api             # Client API endpoint
SESSION_SECRET=your-secret-here      # Session secret
```

## Documentation

- [Architecture](./docs/ARCHITECTURE.md) - System architecture and security model
- [Development Guide](./docs/DEVELOPMENT.md) - Setup, API usage, and backend requirements

## Project Structure

```
src/
├── app/                # Next.js pages and API routes
├── components/         # React components
├── context/            # React context providers
├── services/           # API communication layer
└── types/              # TypeScript definitions
```

## Tech Stack

- **Framework**: Next.js 16
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI**: React 19

## License

MIT License

