# Frontend Structure and File Documentation

This document provides a detailed explanation of the frontend project structure and the function of each file.

## Root Directory Structure
```
frontend/
├── src/               # Source code directory
├── index.html         # Entry HTML file
├── package.json       # Project configuration and dependencies
├── postcss.config.js  # PostCSS configuration
├── tailwind.config.js # Tailwind CSS configuration
└── vite.config.ts     # Vite build tool configuration
```

### Root Configuration Files

#### `index.html`
- Main HTML entry point
- Contains the root div for React mounting
- Loads the main JavaScript entry point

#### `package.json`
- Project metadata and configuration
- Defines dependencies and development dependencies
- Contains script commands for development, building, and testing
- Manages project versions and type definitions

#### `postcss.config.js`
- PostCSS configuration for CSS processing
- Configures Tailwind CSS and Autoprefixer
- Handles CSS transformations and optimizations

#### `tailwind.config.js`
- Tailwind CSS framework configuration
- Defines custom colors and theme extensions
- Specifies content sources for CSS purging
- Configures responsive design breakpoints

#### `vite.config.ts`
- Vite build tool configuration
- Sets up development server settings
- Configures API proxy for backend communication
- Manages build optimization settings

## Source Directory (`src/`)

### Core Files
```
src/
├── main.tsx          # Application entry point
├── App.tsx           # Root React component
├── router.tsx        # Route definitions
└── index.css         # Global styles
```

#### `main.tsx`
- Application bootstrap file
- Renders the root React component
- Sets up React Router
- Initializes global providers

#### `App.tsx`
- Main application component
- Handles layout structure
- Manages authentication state
- Implements route protection

#### `router.tsx`
- Defines application routes
- Handles route protection
- Manages route transitions
- Configures route parameters

#### `index.css`
- Global CSS styles
- Tailwind CSS imports
- Custom CSS variables
- Global utility classes

### Components Directory (`src/components/`)
```
components/
├── AuthForm.tsx      # Authentication form component
├── FileUploader.tsx  # File upload component
└── RecordTable.tsx   # Data display table component
```

#### `AuthForm.tsx`
- Handles user authentication forms
- Manages login and registration
- Implements form validation
- Handles authentication errors

#### `FileUploader.tsx`
- Manages file upload functionality
- Handles file validation
- Shows upload progress
- Manages file processing status

#### `RecordTable.tsx`
- Displays data in tabular format
- Implements sorting and filtering
- Handles pagination
- Manages row actions

### Pages Directory (`src/pages/`)
```
pages/
├── AdminPage.tsx     # Admin dashboard page
├── DashboardPage.tsx # User dashboard page
├── LoginPage.tsx     # User login page
└── RegisterPage.tsx  # User registration page
```

#### `AdminPage.tsx`
- Admin control panel
- User management interface
- System settings
- Administrative functions

#### `DashboardPage.tsx`
- User dashboard interface
- Data visualization
- User activity overview
- Personal settings

#### `LoginPage.tsx`
- User login interface
- Authentication handling
- Error messaging
- Redirect logic

#### `RegisterPage.tsx`
- New user registration
- Form validation
- Account creation
- Welcome flow

### Service and Utility Directories
```
src/
├── services/         # API and service integrations
└── utils/            # Utility functions and helpers
```

#### `services/`
- API integration layer
- Authentication services
- Data fetching utilities
- External service integrations

#### `utils/`
- Helper functions
- Common utilities
- Type definitions
- Constants and configurations

## Development Workflow

### Getting Started
1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Build for production: `npm run build`
4. Preview production build: `npm run preview`

### Development Guidelines
- Use TypeScript for all new components
- Follow component directory structure
- Implement responsive design using Tailwind
- Maintain type safety throughout the application 