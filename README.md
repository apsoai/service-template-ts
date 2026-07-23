# Apso TypeScript Service Template

The GitHub template behind every Apso TypeScript backend: NestJS, TypeORM, and PostgreSQL. `apso init --name my-api --language typescript` clones this repository, and `apso generate` turns your `.apsorc` schema into entities, controllers, services, and migrations inside it. The generated code is yours: Apache-2.0 licensed, no Apso SDK, no runtime dependency.

New to Apso? The [quickstart](https://docs.apso.ai/get-started/quickstart) goes from schema to running API in about ten minutes. All three language templates are listed at [apso.ai/templates](https://apso.ai/templates).

## Features

- NestJS-based service architecture
- Dual API support (REST and GraphQL)
- TypeORM integration with PostgreSQL
- Built-in authentication and authorization
- Health check endpoints
- Comprehensive testing setup
- OpenAPI/Swagger documentation
- Docker and docker-compose support
- AWS Lambda deployment ready
- Database seeding support
- Automatic migration management

## Getting Started

### Prerequisites

- Node.js (version specified in .nvmrc)
- npm or yarn
- Docker and docker-compose (for local development)
- PostgreSQL

### Installation

1. This template is typically used via the APSO CLI. However, you can also use it directly:

```bash
# Clone the repository
git clone https://github.com/apsoai/service-template-ts.git

# Install dependencies
npm install
```

2. Set up your environment variables:

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit the file with your configuration
nano .env.local
```

### Development

```bash
# Start the development server
npm run start:dev

# Run in watch mode
npm run start:dev

# Build for production
npm run build

# Run production build
npm run start:prod
```

### Database Management

```bash
# Create a new migration
npm run db:create --name=your-migration-name

# Generate migrations from entity changes
npm run db:generate

# Run migrations
npm run db:migrate

# Rollback last migration
npm run db:rollback

# Seed the database
npm run seed
```

### Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Docker Support

```bash
# Start the development environment
npm run compose

# View logs
npm run log

# Shut down containers
npm run shutdown
```

## Project Structure

```
src/
├── config/           # Configuration modules and constants
├── migrations/       # Database migrations
├── seeders/         # Database seeders
├── test-module/     # Example module implementation
├── utils/           # Shared utilities
├── healthCheck/     # Health check endpoints
├── autogen/         # Auto-generated code (if any)
├── app.module.rest.ts    # REST API module configuration
├── app.module.graphql.ts # GraphQL API module configuration
├── main.ts          # Application entry point
└── lambda.ts        # AWS Lambda handler
```

## API Documentation

- REST API documentation is available at `/api` when running in development mode
- GraphQL playground is available at `/graphql` when running in development mode

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## Architecture Decisions

This template follows Domain-Driven Design principles and SOLID patterns:

- Clear separation of concerns
- Modular architecture
- Repository pattern for data access
- Dependency injection
- Configurable API layers (REST/GraphQL)

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.

## Support

For support, please:

1. Check the project documentation
2. Open an issue on the GitHub repository
3. Contact the APSO team

## Acknowledgments

- Built on [NestJS](https://nestjs.com/)
- Inspired by best practices in microservice architecture
- Community contributions welcome!
