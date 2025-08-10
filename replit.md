# Overview

This is a full-stack e-commerce website for promotional products, closely modeled after amrod.co.za functionality. The application serves as a B2B platform for trade customers, featuring product listings, branding calculators, cart management, and quote requests. The system integrates with the Amrod API to pull real product data including pricing, categories, stock levels, and branding options.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript, using Vite for build tooling
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state and React Context for cart management
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS styling
- **Forms**: React Hook Form with Zod validation schemas

## Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **API Structure**: RESTful endpoints for products, categories, cart, and branding calculations
- **Data Layer**: Drizzle ORM with PostgreSQL dialect for database operations
- **Caching Strategy**: Local storage layer to cache Amrod API responses for improved performance
- **Session Management**: Session-based cart tracking using cryptographically generated session IDs

## Data Storage Solutions
- **Primary Database**: PostgreSQL configured via Drizzle ORM
- **Schema Design**: Separate tables for products, categories, branding methods, cart items, quote requests, and API sync logs
- **Caching Layer**: In-memory storage interface with methods for bulk operations and filtered queries
- **Data Synchronization**: Scheduled sync every 6 hours to pull fresh data from Amrod API

## Authentication & Authorization
- **User Management**: Basic user authentication with username/password stored in PostgreSQL
- **Session Handling**: Server-side session management for cart persistence
- **Trade Registration**: Multi-step registration process capturing business details and verification documents

## External Service Integrations
- **Amrod API**: Primary data source for products, categories, pricing, and stock levels
- **Sync Scheduler**: Automated background service to refresh cached data from external API
- **Branding Calculator**: Real-time price calculations based on API pricing tables

## Key Features
- **Product Catalog**: Filterable product listings with search, category, brand, and price range filters
- **Product Details**: Comprehensive product pages with image galleries, specifications, and variant selection
- **Branding Tools**: Interactive calculator for branding costs with live price updates
- **Shopping Cart**: Session-persistent cart with quantity management and removal capabilities
- **Quote System**: Request for quote functionality for trade customers
- **Responsive Design**: Mobile-first responsive layout with optimized navigation

## Development & Deployment
- **Build System**: Vite for frontend bundling with hot module replacement
- **Development Server**: Express server with Vite middleware integration
- **Database Migrations**: Drizzle migrations with push-based schema updates
- **Environment Configuration**: Environment variables for API keys and database connections