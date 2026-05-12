# Overview

This is a comprehensive Smart Waste Monitoring Dashboard application designed for municipal waste management. The system allows tracking waste reports from citizens, managing worker assignments, and providing analytics for waste collection efficiency. It's built as a full-stack web application with a modern React frontend and Express.js backend, designed for scalability and real-time monitoring of waste management operations.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side application is built with React 18 and uses a modern component-based architecture:

- **UI Framework**: React with TypeScript for type safety
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **Animations**: Framer Motion for smooth UI transitions
- **Charts**: Recharts for data visualization and analytics

The frontend follows a modular structure with separate pages for Dashboard, Reports, Workers, Citizens, Analytics, and Settings. Components are organized using the shadcn/ui pattern with reusable UI components in the `/components/ui` directory.

## Backend Architecture
The server-side uses Node.js with Express.js in a RESTful API pattern:

- **Framework**: Express.js with TypeScript for the REST API
- **Development Server**: Vite integration for hot module replacement in development
- **Validation**: Zod schemas for runtime type validation
- **Database Layer**: Drizzle ORM with PostgreSQL support
- **Storage Interface**: Abstracted storage layer with in-memory implementation for development

The backend implements a clean separation of concerns with dedicated route handlers, storage abstraction, and middleware for logging and error handling.

## Data Storage Solutions
The application uses a flexible data storage approach:

- **Production Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Development Storage**: In-memory storage implementation for quick development iteration
- **Schema Management**: Shared TypeScript schemas between frontend and backend for consistency
- **Database Migrations**: Drizzle Kit for database schema migrations

Key entities include Users, Reports, Workers, and Citizens with proper relationships and validation.

## Authentication and Authorization
Currently uses a basic user system with placeholder authentication mechanisms. The schema includes user management with username/password fields, preparing for future authentication implementation.

## External Service Integrations
The application integrates with several external services:

- **Database**: Neon Database (PostgreSQL) via `@neondatabase/serverless`
- **Maps**: Prepared for mapping integration with coordinate storage for waste report locations
- **UI Components**: Radix UI primitives for accessibility-compliant interface components
- **Development Tools**: Replit-specific integrations for development environment support

The system is designed to be cloud-native and easily deployable, with environment variable configuration for database connections and external service credentials.