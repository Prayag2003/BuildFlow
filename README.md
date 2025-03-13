# Microservices Build System

A distributed build system that enables automated deployment of microservices using GitHub, AWS ECS, and S3 storage.

## Theory and Concepts

### Microservices Architecture

The system follows microservices principles, breaking down the build process into independent, loosely-coupled services. This architecture enables:

- Independent scaling of build workers
- Isolation of concerns
- Improved fault tolerance
- Easier maintenance and updates

### Event-Driven Architecture

The system operates on an event-driven model where:

1. GitHub webhooks trigger build events
2. API server processes these events asynchronously
3. Build servers react to build requests
4. S3 storage captures build artifacts
   This approach enables loose coupling and high scalability.

## System Architecture

The system consists of three main components:

### 1. API Server

A Node.js/TypeScript server that handles incoming webhook events from GitHub and manages the build process. It coordinates with the build servers and provides status updates.

### 2. Build Server

Containerized build environments running in AWS ECS that execute the actual build processes. Multiple build servers can run in parallel to handle concurrent builds.

### 3. S3 Reverse Proxy

A service that manages secure access to build artifacts stored in AWS S3, providing controlled access to build outputs.

## Project Structure

```
.
├── api-server/               # Main API service
│   ├── index.ts             # Server entry point
│   ├── package.json         # Dependencies and scripts
│   ├── pnpm-lock.yaml       # Lock file for dependencies
│   └── tsconfig.json        # TypeScript configuration
│
├── assets/                  # Project assets
│   └── HLD.png             # High-level design diagram
│
├── build-server/           # Build service
│   ├── Dockerfile          # Container definition
│   ├── main.sh            # Build orchestration script
│   ├── package.json       # Dependencies and scripts
│   ├── pnpm-lock.yaml     # Lock file for dependencies
│   ├── script.ts          # Build logic
│   └── tsconfig.json      # TypeScript configuration
│
└── s3-reverse-proxy/      # S3 proxy service
    ├── index.ts           # Proxy entry point
    ├── package.json       # Dependencies and scripts
    ├── pnpm-lock.yaml     # Lock file for dependencies
    └── tsconfig.json      # TypeScript configuration
```

## Prerequisites

- Node.js 18 or higher
- pnpm package manager
- Docker
- AWS Account with configured credentials
- GitHub repository with appropriate webhook configuration

## Setup Instructions

1. **API Server Setup**

```bash
cd api-server
pnpm install
pnpm build
pnpm start
```

2. **Build Server Setup**

```bash
cd build-server
docker build -t build-server .
# Configure AWS ECS task definition and service
```

3. **S3 Reverse Proxy Setup**

```bash
cd s3-reverse-proxy
pnpm install
pnpm build
pnpm start
```

## Configuration

### API Server

Create a `.env` file in the `api-server` directory:

```env
PORT=3000
GITHUB_WEBHOOK_SECRET=your_webhook_secret
AWS_REGION=your_aws_region
```

### Build Server

Configure the following environment variables in your ECS task definition:

```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
BUILD_TIMEOUT=3600
```

### S3 Reverse Proxy

Create a `.env` file in the `s3-reverse-proxy` directory:

```env
PORT=3001
AWS_REGION=your_aws_region
S3_BUCKET=your_bucket_name
```

## Usage

1. Configure your GitHub repository to send webhook events to your API server endpoint.
2. When a push event is received, the API server will:
      - Validate the webhook signature
      - Create a new build task in ECS
      - Monitor build progress
      - Store build artifacts in S3
3. Access build artifacts through the S3 reverse proxy using appropriate authentication.

## Development

### Running Locally

Each service can be run locally for development:

```bash
# API Server
cd api-server
pnpm dev

# Build Server
cd build-server
pnpm dev

# S3 Reverse Proxy
cd s3-reverse-proxy
pnpm dev
```

### Testing

Each service includes its own test suite:

```bash
# Run tests for any service
pnpm test
```

## Deployment

### API Server

1. Build the TypeScript code:

```bash
cd api-server
pnpm build
```

2. Deploy using your preferred hosting solution (e.g., AWS ECS, EC2)

### Build Server

1. Build and push the Docker image:

```bash
cd build-server
docker build -t build-server .
docker push your-registry/build-server
```

2. Update ECS task definition and service

### S3 Reverse Proxy

1. Build the TypeScript code:

```bash
cd s3-reverse-proxy
pnpm build
```

2. Deploy using your preferred hosting solution

## Security

- All services use HTTPS for communication
- GitHub webhooks are validated using secrets
- AWS resources are protected using IAM roles and policies
- S3 access is controlled through the reverse proxy
- Environment variables are used for sensitive configuration

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
