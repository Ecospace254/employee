# Employee Onboarding Platform

## Overview

This is a comprehensive employee onboarding platform designed to streamline the new hire experience. The application provides a SharePoint-inspired interface where new employees can access training materials, complete onboarding checklists, meet team members, and connect with company resources. The platform features a dashboard-style layout with action cards, popular portals, company culture sections, and team member profiles to facilitate a smooth transition for new hires.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client uses a modern React-based stack with TypeScript for type safety. The UI is built with a comprehensive component library using Radix UI primitives and styled with Tailwind CSS. The design follows SharePoint-inspired patterns with a professional blue color scheme (220 85% 35%) and enterprise-focused layouts. State management is handled through TanStack Query for server state and React hooks for local state. Routing is implemented with Wouter for a lightweight routing solution.

### Backend Architecture
The server is built with Express.js and TypeScript, providing a RESTful API structure. Authentication is handled through Passport.js with local strategy using session-based authentication. Password security is implemented with Node.js crypto module using scrypt hashing with salt. The application uses middleware for request logging and error handling, with proper error boundaries and status code management.

### Data Storage Solutions
The application is configured to use PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. The schema includes comprehensive user management with roles (employee, manager, hr), onboarding checklists, announcements, and events. Database migrations are managed through Drizzle Kit. For development environments, an in-memory storage implementation is available as a fallback.

### Authentication and Authorization
Session-based authentication is implemented with secure cookie handling and CSRF protection. User roles support different permission levels (employee, manager, hr) with role-based access control throughout the application. Password requirements enforce minimum 6-character lengths with secure hashing and salt storage.

### Component Design System
The UI follows a systematic design approach with consistent spacing units (2, 4, 6, 8), typography hierarchy using Segoe UI font family, and a comprehensive color palette supporting both light and dark modes. Components are built with accessibility in mind using Radix UI primitives and follow enterprise design patterns for forms, cards, navigation, and data display.

## Recent Implementations

### Employee Onboarding Checklist (September 2025)
Implemented a comprehensive SharePoint-style onboarding checklist page at `/checklist` with complete CRUD functionality. The system allows new employees to track their onboarding progress through an interactive task management interface.

**Key Features:**
- SharePoint-inspired interface with action control bar (Add item, Edit grid view, Help, Share, Copy link, Export, Forms, Automate, Integrate)
- Interactive table with sortable columns: Work, Description, Complete by, Completed, Completed on, Mentor, Relevant link, Relevant files
- Add new item dialog with form validation for required fields
- Checkbox controls for marking task completion with real-time status updates
- Status badges (Done/Pending) with proper styling and completion timestamps
- SEO optimization with proper page titles and meta descriptions

**Technical Implementation:**
- Protected route requiring authentication with session-based security
- RESTful API endpoints: GET/POST/PUT/DELETE `/api/checklist` with authentication guards
- TanStack Query for optimistic updates and cache management
- Default checklist items automatically created for new users
- Comprehensive test coverage with data-testid attributes for UI testing
- Fixed API parameter ordering bug in mutations for proper functionality

## External Dependencies

### Database Services
- **PostgreSQL**: Primary database through Neon serverless PostgreSQL
- **Drizzle ORM**: Type-safe database operations and migrations
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### UI Framework and Styling
- **React**: Frontend framework with TypeScript support
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Radix UI**: Accessible component primitives for complex UI components
- **Lucide React**: Icon library for consistent iconography

### Development and Build Tools
- **Vite**: Frontend build tool with hot module replacement
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind and Autoprefixer

### Authentication and Security
- **Passport.js**: Authentication middleware with local strategy
- **Express Session**: Session management with secure cookie handling
- **bcrypt/scrypt**: Password hashing and security

### State Management and Data Fetching
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form state management with validation
- **Zod**: Runtime type validation and schema validation

### Asset Management
- **Generated Images**: Static assets for onboarding cards and team member photos stored in attached_assets directory