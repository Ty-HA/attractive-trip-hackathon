# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands

- `npm run dev` - Start development server (Vite) on port 8080
- `npm run build` - Production build using Vite
- `npm run build:dev` - Development build using Vite
- `npm run lint` - Run ESLint on the codebase
- `npm run preview` - Preview production build locally

### Package Manager

This project uses npm with package-lock.json. Bun is also available (bun.lockb exists).

### Development Server Configuration

- Default development server runs on port 8080 (configured in vite.config.ts)
- Server binds to "::" (IPv6 wildcard) to accept connections from any interface

## Project Architecture

### Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite with SWC plugin for fast compilation
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **Database**: Supabase (PostgreSQL)
- **State Management**: React Query (@tanstack/react-query) for server state
- **Routing**: React Router DOM
- **Forms**: React Hook Form with Zod validation

### Project Structure

```text
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components (50+ components)
│   ├── ConversationalAI.tsx  # AI chat interface
│   ├── Header.tsx       # Main navigation
│   └── Footer.tsx       # Site footer
├── pages/               # Route components (14+ pages)
│   ├── Index.tsx        # Homepage
│   ├── Destinations.tsx # Travel destinations
│   ├── Auth.tsx         # Authentication
│   └── Admin.tsx        # Admin dashboard
├── contexts/            # React contexts
│   ├── LanguageContext.tsx     # Multi-language support (extensive translations)
│   └── ConversationalAIContext.tsx  # AI chat state
├── hooks/               # Custom React hooks
├── integrations/supabase/  # Database integration
│   ├── client.ts        # Supabase client configuration
│   └── types.ts         # Database type definitions
├── lib/                 # Utility functions
└── assets/              # Static assets
```

### Key Architectural Patterns

#### Provider Pattern

The app uses multiple context providers wrapping the entire application:

- `QueryClientProvider` - React Query for server state
- `AuthProvider` - Authentication state management
- `LanguageProvider` - Internationalization (i18n)
- `ConversationalAIProvider` - AI chat functionality

#### Database Integration

- Supabase client configured in `src/integrations/supabase/client.ts`
- Type-safe database types in `src/integrations/supabase/types.ts`
- Edge functions available in `supabase/functions/`

#### Styling System

- CSS variables defined in `src/index.css` for theming
- Custom Tailwind configuration with extended color palette
- Font families: Inter (sans), Playfair Display (display)
- Dark mode support via class-based switching

#### Component Architecture

- shadcn/ui components for consistent UI primitives
- Custom components built on top of Radix UI
- Form components using React Hook Form + Zod validation
- Responsive design with mobile-first approach

### Multi-language Support

The `LanguageContext` contains extensive translations for French and English, including:

- Navigation, forms, and UI text
- Error messages and validation text
- Content for destinations, activities, and travel information
- Legal pages (CGU, CGV, privacy policy)

### AI Integration

- Conversational AI component provides chat interface
- Context manages AI conversation state
- Integrated throughout the travel booking experience

### Authentication & Admin

- Custom auth hook (`useAuth`) for user management
- Admin dashboard for content management
- Protected routes and role-based access

## Database Schema

The application uses Supabase with the following main tables:

- **destinations** - Travel destinations with location data, pricing, and metadata
- **activities** - Activities linked to destinations with booking details
- **packages** - Travel packages combining destinations and services
- **restaurants** - Restaurant information linked to destinations and packages
- **profiles** - User profiles extending auth.users
- **user_roles** - Role-based access control system

## Configuration Files

- `components.json` - shadcn/ui configuration
- `tailwind.config.ts` - Tailwind CSS configuration with custom theme
- `vite.config.ts` - Vite build configuration with alias support and development tagging
- `eslint.config.js` - ESLint configuration (TypeScript + React)
- `tsconfig.json` - TypeScript configuration
- `postcss.config.js` - PostCSS configuration for Tailwind CSS

## Onboarding System & Trip Management

### Intelligent Onboarding Flow

The app features a comprehensive slot-filling onboarding system that guides users through personalized trip planning:

#### Core Features
- **Smart slot-filling**: Asks questions one by one to gather preferences (trip_type, companions, duration, budget, origin_city)
- **Quick replies**: Interactive buttons for common choices (City-break, Beach, Nature, etc.)
- **Adaptive logic**: Family trips → asks for children ages, low budget + long duration → suggests alternatives
- **Conversation persistence**: Saves preferences in `user_preferences` table
- **Personalized recommendations**: Generates 3 options (Good/Better/Best) based on user slots

#### Database Tables
- **user_preferences**: Stores onboarding slots and completion status
- **archived_conversations**: Complete trip archives with metadata
- **chat_history**: Real-time conversation storage

#### Trip Management
- **Archive System**: Save completed onboarding sessions as trips with auto-generated titles
- **Reset Function**: Clear current conversation and start fresh onboarding  
- **Trip History**: View all saved trips with filtering (planned/booked/completed)
- **Status Tracking**: planned → booking_started → booked → completed

### Key Components
- **ConversationalAI.tsx**: Main chat interface with onboarding logic and trip management buttons
- **MesVoyages.tsx**: Trip history page with filtering, favorites, and trip management
- **Edge Function**: PlannerAgent handles slot-filling, recommendations, and trip archiving

### User Flow
1. User starts chat → Automatic onboarding with quick replies
2. AI asks questions sequentially → Fills essential slots  
3. When complete → Shows 3 personalized recommendations
4. User can "Save trip" → Archives conversation with metadata
5. "New trip" button → Resets for fresh onboarding
6. "My trips" → View complete trip history with actions

## important-instruction-reminders

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.