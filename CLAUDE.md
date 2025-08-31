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

## Supabase Edge Functions

### travel-concierge Function

The main AI backend function powered by Perplexity API:

#### Environment Requirements
- `PERPLEXITY_API_KEY` - Perplexity API key for intelligent search
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key for database access

#### Function Capabilities
- **Conversational AI**: Natural language processing with context awareness
- **Multi-language Support**: French/English system prompts and responses
- **Slot-filling Logic**: Progressive information gathering for travel preferences
- **Search Integration**: Real-time travel data aggregation and recommendations
- **Database Integration**: User preferences and conversation history management

### Database Schema

The application uses Supabase with the following main tables:

#### Core Travel Data
- **destinations** - Travel destinations with location data, pricing, and metadata
- **activities** - Activities linked to destinations with booking details
- **packages** - Travel packages combining destinations and services
- **restaurants** - Restaurant information linked to destinations and packages

#### User Management & Personalization
- **profiles** - User profiles extending auth.users
- **user_roles** - Role-based access control system
- **user_preferences** - Onboarding slot-filling data and travel preferences
- **archived_conversations** - Complete trip planning sessions with metadata
- **chat_history** - Real-time conversation storage for context continuity

#### Advanced Features
- **Vector embeddings support** - pgvector extension for similarity search (RAG system ready)
- **Real-time subscriptions** - Live chat and preference updates
- **Row Level Security** - User-specific data isolation and access control

## Configuration Files

- `components.json` - shadcn/ui configuration
- `tailwind.config.ts` - Tailwind CSS configuration with custom theme
- `vite.config.ts` - Vite build configuration with alias support and development tagging
- `eslint.config.js` - ESLint configuration (TypeScript + React)
- `tsconfig.json` - TypeScript configuration
- `postcss.config.js` - PostCSS configuration for Tailwind CSS

## AI-Powered Travel Concierge System

### Conversational AI Architecture

The application features an advanced conversational AI system powered by Perplexity API that transforms travel planning into natural dialogue:

#### Voice-Enabled Interaction
- **Speech Recognition**: Browser Web Speech API integration for hands-free interaction
- **Text-to-Speech**: AI responses spoken aloud for immersive conversation
- **Intelligent Form Filling**: Voice input automatically populates form fields (destination, budget, dates, people)
- **Conversation Flow Control**: AI stops speaking when user talks, preventing feedback loops
- **Multi-language Voice Support**: French/English speech recognition and synthesis

#### Smart Form Integration
- **Visual + Voice Input**: Traditional form inputs enhanced with voice recognition
- **Real-time Extraction**: Parses natural language to extract structured data
- **Pattern Recognition**: Handles complex date formats ("du 5 au 10 septembre"), budget ranges, travel group sizes
- **Form Persistence**: Visual form stays populated as conversation continues

#### Intelligent Trip Planning
- **Contextual Understanding**: Maintains conversation context across interactions
- **Progressive Information Gathering**: AI asks essential questions (budget, duration, dates, people) before detailed suggestions
- **Adaptive Responses**: Tailors conversation style based on user preferences
- **Multi-modal Feedback**: Both visual form updates and conversational responses

### Database Schema & Trip Management

#### Core Tables
- **user_preferences**: Stores onboarding slots and completion status with slot-filling logic
- **archived_conversations**: Complete trip archives with auto-generated titles and metadata
- **chat_history**: Real-time conversation storage for context continuity

#### Advanced Features
- **Smart Trip Archiving**: Automatic title generation from conversation content
- **Trip Status Tracking**: planned → booking_started → booked → completed progression
- **Conversation Context**: Full chat history maintains conversation continuity
- **Form Data Integration**: Combines visual form data with conversational context

### Edge Function Architecture (travel-concierge)

The Supabase Edge Function serves as the intelligent backend:

#### Core Capabilities
- **Perplexity API Integration**: Real-time web intelligence for travel recommendations
- **Slot-filling Logic**: Structured onboarding with essential information gathering
- **Context Management**: Conversation history and user preferences integration
- **Multi-language Support**: Intelligent responses in French and English
- **Search Intelligence**: Transforms travel queries into actionable recommendations

#### Key Functions
- **Natural Language Processing**: Converts user requests into structured travel data
- **Recommendation Engine**: Generates personalized travel options based on preferences
- **Conversation Flow Management**: Maintains dialogue context and progression
- **Data Persistence**: Saves user preferences and conversation history

### Key Components

#### ConversationalAI.tsx - Main Chat Interface
- **Voice Recognition System**: Complete speech-to-text implementation
- **Form Auto-filling**: Voice input automatically populates visual form
- **Conversation Management**: Real-time chat with AI response handling
- **Trip Management**: Archive, reset, and history navigation
- **Multi-modal Interaction**: Seamless switching between voice and text input

#### Voice Integration Features
- **Continuous Recognition**: Extended listening periods for complete sentences
- **Smart Filtering**: Prevents AI-generated text from being re-processed
- **Context Awareness**: Integrates voice input with existing form data
- **Feedback Prevention**: Stops recognition during AI speech synthesis
- **Error Handling**: Comprehensive permission and browser compatibility management

### User Experience Flow

1. **Initial Interaction**: User sees form with voice control button
2. **Voice Activation**: Click microphone or "AI Voice Chat" button
3. **Natural Conversation**: Speak travel desires naturally ("Je veux aller à Bali pour 2 personnes budget 3000 euros")
4. **Intelligent Processing**: AI extracts structured data and fills form automatically
5. **Contextual Response**: AI responds both in text and optionally voice
6. **Progressive Refinement**: AI asks clarifying questions for missing essential information
7. **Trip Creation**: Complete conversation can be archived with smart title generation

## important-instruction-reminders

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.

## File Naming Convention

**IMPORTANT**: Always use English names for new files and components. Avoid French names going forward.

Examples:
- ✅ `TripHistory.tsx` instead of `MesVoyages.tsx`
- ✅ `trip-archive/` instead of `mes-voyages/` 
- ✅ `UserTrips.tsx` instead of `VoyagesUtilisateur.tsx`
- ✅ `BookingDetails.tsx` instead of `DetailsReservation.tsx`

This ensures consistency and international compatibility. Existing French-named files can remain but all new files should use English naming.