# Link Scraper

A web application that allows users to submit URLs and extract all links from the target web pages. The application provides user authentication, real-time status updates, and a clean interface for viewing scraped links.

## Features

- **User Authentication**: Register with username and password, login with email and password
- **URL Submission**: Submit any URL to be scraped for links
- **Link Extraction**: Extract all `<a>` tags from the submitted web pages
- **Real-time Status Updates**: Track the status of scraping jobs in real-time
- **Pagination**: Browse through pages and links with pagination support
- **Responsive UI**: Clean and responsive interface built with React and Bootstrap
- **Security**: SSRF protection, URL validation, and environment-based configuration
- **Comprehensive Testing**: Unit, integration, and E2E tests for all components

## Tech Stack

### Backend

- **Node.js** with **Express.js** for the API server
- **TypeScript** for type safety and better developer experience
- **PostgreSQL** for data storage
- **Prisma** as the ORM for database operations
- **Bull** with **Redis** for job queue management
- **JWT** for authentication
- **Cheerio** for HTML parsing

### Frontend

- **React** with **TypeScript** for the user interface
- **React Router** for client-side routing
- **Bootstrap** for styling
- **Axios** for API communication

### Testing

- **Jest** as the test runner
- **Supertest** for API integration testing
- **React Testing Library** for component testing
- **Mock Service Worker** for API mocking

## Project Structure

This project is organized as a pnpm monorepo with the following packages:

```
link-scraper/
├── docker-compose.yml        # Docker configuration for PostgreSQL and Redis
├── package.json              # Root package.json with scripts
├── pnpm-workspace.yaml       # pnpm workspace configuration
├── jest.config.js            # Jest configuration for testing
├── .env                      # Root environment variables
├── .env.example              # Example root environment variables
├── __mocks__/                # Mock files for testing
│   ├── @link-scraper-shared.d.ts  # Type declarations for shared package
│   ├── @prisma-client-mock.d.ts   # Type declarations for Prisma client
│   ├── bull.d.ts                  # Type declarations for Bull
│   ├── jest-setup.js              # Jest setup file
│   ├── mock-bull.js               # Bull queue mock
│   ├── mock-prisma.js             # Prisma client mock
│   └── mock-shared.js             # Shared package mock
├── packages/
│   ├── api/                  # API server (TypeScript)
│   │   ├── src/              # TypeScript source code
│   │   │   ├── middleware/   # Express middleware
│   │   │   ├── routes/       # API routes
│   │   │   ├── scripts/      # Database scripts
│   │   │   ├── types/        # TypeScript type definitions
│   │   │   ├── utils/        # Utility functions
│   │   │   └── server.ts     # API entry point
│   │   ├── tests/            # API tests
│   │   │   ├── unit/         # Unit tests
│   │   │   │   ├── auth.test.ts
│   │   │   │   └── url-validator.test.ts
│   │   │   └── integration/  # Integration tests
│   │   │       └── auth.test.ts
│   │   ├── prisma/           # Prisma schema and migrations
│   │   ├── .env              # API environment variables
│   │   ├── .env.example      # Example API environment variables
│   │   ├── package.json      # API dependencies
│   │   ├── tsconfig.json     # TypeScript configuration
│   │   └── tsconfig.build.json # Build-specific TypeScript configuration
│   ├── worker/               # Worker service (TypeScript)
│   │   ├── src/              # TypeScript source code
│   │   │   ├── types/        # TypeScript type definitions
│   │   │   ├── utils/        # Utility functions
│   │   │   └── worker.ts     # Worker entry point
│   │   ├── tests/            # Worker tests
│   │   │   ├── setup.ts      # Test setup file
│   │   │   └── integration/  # Integration tests
│   │   │       └── scraper.test.ts
│   │   ├── .env              # Worker environment variables
│   │   ├── .env.example      # Example worker environment variables
│   │   ├── package.json      # Worker dependencies
│   │   ├── tsconfig.json     # TypeScript configuration
│   │   └── tsconfig.build.json # Build-specific TypeScript configuration
│   └── frontend/             # React frontend
│       ├── public/           # Static files
│       ├── src/              # React source code
│       │   ├── components/   # Reusable components
│       │   ├── contexts/     # React contexts
│       │   ├── pages/        # Page components
│       │   ├── services/     # API services
│       │   └── types/        # TypeScript types (package-specific)
│       ├── tests/            # Frontend tests
│       │   ├── jest-dom.d.ts # Jest DOM type declarations
│       │   ├── setup.ts      # Test setup file
│       │   └── e2e/          # End-to-end tests
│       │       └── auth.test.tsx
│       ├── .env              # Frontend environment variables
│       ├── .env.example      # Example frontend environment variables
│       ├── package.json      # Frontend dependencies
│       └── tsconfig.json     # TypeScript configuration
```

## Prerequisites

- Node.js (v14 or higher)
- pnpm (v7 or higher)
- Docker and Docker Compose (for PostgreSQL and Redis)

## Environment Configuration

The application uses environment variables for configuration. Example `.env.example` files are provided for each package. Copy these files to `.env` and update the values as needed.

### Root Environment Variables

```ini
# PostgreSQL Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=link_scraper

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Node Environment
NODE_ENV=development
```

### API Environment Variables

```ini
# Server Configuration
PORT=3001
HOST=localhost

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/link_scraper

# Redis
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRATION=24h

# Security
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Worker Environment Variables

```ini
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/link_scraper

# Redis
REDIS_URL=redis://localhost:6379

# Worker Configuration
CONCURRENCY=10
MAX_ATTEMPTS=5
BACKOFF_DELAY=10000

# Scraper Settings
MAX_CONTENT_SIZE=5242880  # 5MB in bytes
REQUEST_TIMEOUT=30000     # 30 seconds in milliseconds
USER_AGENT=Mozilla/5.0 (compatible; LinkScraper/1.0; +https://example.com/bot)

# Security
NODE_ENV=development
```

### Frontend Environment Variables

```ini
# API Configuration
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_API_TIMEOUT=30000

# Authentication
REACT_APP_TOKEN_KEY=token

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_DEBUG_MODE=true

# Build Configuration
GENERATE_SOURCEMAP=true
BROWSER=none  # Prevents browser from opening during development
```

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/inaldomonteiroti/link-scraper.git
   cd link-scraper
   ```

2. Install dependencies:

   ```
   pnpm install
   ```

3. Set up environment variables:

   ```
   cp .env.example .env
   cp packages/api/.env.example packages/api/.env
   cp packages/worker/.env.example packages/worker/.env
   cp packages/frontend/.env.example packages/frontend/.env
   ```

4. Start the database services:

   ```
   pnpm run db:up
   ```

5. Create the database schema:

   ```
   pnpm run db:migrate
   ```

6. Generate Prisma client:

   ```
   pnpm run db:generate
   ```

7. Initialize the database with test data (optional):

   ```
   pnpm run db:init
   ```

8. Build the packages:
   ```
   pnpm run build
   ```

## Running the Application

Start all services (API, worker, and frontend):

```
pnpm start
```

Or start each service individually:

```
pnpm --filter @link-scraper/api start      # Start the API server
pnpm --filter @link-scraper/worker start   # Start the worker service
pnpm --filter @link-scraper/frontend start # Start the React frontend
```

The application will be available at:

- Frontend: http://localhost:3000
- API: http://localhost:3001

## Development

For development, you can run each service in development mode:

```
# In separate terminals:
pnpm --filter @link-scraper/api dev
pnpm --filter @link-scraper/worker dev
pnpm --filter @link-scraper/frontend start
```

## Testing

The project includes a comprehensive test suite with unit, integration, and end-to-end tests. Each package contains its own tests in a `tests` directory.

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test types
pnpm test:unit
pnpm test:integration
pnpm test:e2e

# Generate coverage report
pnpm test:coverage
```

### Test Structure

- **Unit Tests**: Test individual functions and components in isolation
  - API: `packages/api/tests/unit/`
    - Authentication middleware tests
    - URL validator utility tests
- **Integration Tests**: Test interactions between components

  - API: `packages/api/tests/integration/`
    - Authentication routes tests with mocked database
  - Worker: `packages/worker/tests/integration/`
    - Scraper functionality tests

- **End-to-End Tests**: Test complete user flows
  - Frontend: `packages/frontend/tests/e2e/`
    - Authentication UI tests with React Testing Library

### Mock Files

The project uses various mocks for testing, located in the root `__mocks__` directory:

- Mock Prisma client for database testing
- Mock Bull queue for job processing testing
- Type declarations for TypeScript compatibility

## Test User

After running `pnpm run db:init`, you can log in with the following credentials:

- Email: test@example.com
- Password: password

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user

### Pages

- `POST /api/pages` - Submit a URL for scraping
- `GET /api/pages` - Get all pages for the authenticated user
- `GET /api/pages/:id` - Get a specific page with its links

## Security Features

- **SSRF Protection**: The application validates URLs to prevent Server-Side Request Forgery attacks
- **Environment-Based Security**: Different security settings for development and production environments
- **JWT Authentication**: Secure authentication with JSON Web Tokens
- **Content Type Validation**: Ensures only HTML content is processed
- **URL Normalization**: Prevents duplicate entries and improves security
- **User Data Isolation**: Each user can only access their own page scraping history
  - API routes filter data by the authenticated user's ID
  - Pages and links are associated with specific users
  - Authentication middleware verifies user identity for each request

## Assumptions and Trade-offs

- **Link Extraction**: Only `<a>` tags are extracted, as specified in the requirements. JavaScript-generated links are not included.
- **Link Name**: For links with complex HTML content, we extract the text content and truncate if necessary.
- **Duplicate Links**: Links with the same URL on the same page are stored only once (using a unique constraint).
- **Error Handling**: Failed scraping jobs are marked as 'failed' and the error message is stored.
- **Rate Limiting**: Basic rate limiting is implemented to avoid overloading target servers.
- **Timeouts**: Requests have a 30-second timeout and a 5MB size limit to prevent hanging on large pages.
- **Local Development**: In development mode, localhost URLs are allowed for testing purposes.

## Future Improvements

- Add more comprehensive test coverage
- Implement more robust error handling
- Add user roles and permissions
- Improve scraping performance with worker pools
- Add more detailed analytics for scraped pages
- Support for scraping other elements beyond links
- Add export functionality for scraped data
- Implement rate limiting per domain to be more respectful to target servers
