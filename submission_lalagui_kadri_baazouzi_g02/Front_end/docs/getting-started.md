# Getting Started

## Prerequisites

- Node.js 18.0 or higher
- pnpm (recommended) or npm
- Git

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dms-user-management
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Start the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

## Initial Setup

### Default Users

The system comes with two default users for testing:

1. Admin User:
   - Email: admin@example.com
   - Password: admin123

2. Regular User:
   - Email: user@example.com
   - Password: user123

### Project Structure

```
├── app/                    # Next.js 13+ app directory
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── documents/        # Document management components
│   ├── folders/          # Folder management components
│   └── ui/              # Shared UI components
├── contexts/             # React contexts
├── lib/                 # Utility functions and API
└── public/              # Static assets
```

## Development Workflow

1. Create a new branch for your feature:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and commit them:
```bash
git add .
git commit -m "feat: your feature description"
```

3. Run tests:
```bash
pnpm test
```

4. Push your changes:
```bash
git push origin feature/your-feature-name
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm test` - Run tests

## Next Steps

- Read the [Architecture Overview](./architecture.md)
- Check out the [User Guide](./user-guide.md)
- Review [Development Guidelines](./development.md)