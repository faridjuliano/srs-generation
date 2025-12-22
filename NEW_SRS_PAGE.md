# New SRS Generation Page

## Overview
I've created a new page at `/new-srs` that implements the design from the provided HTML file. This page features a comprehensive form-based interface for generating Software Requirements Specifications (SRS).

## Features

### Layout
- **Three-panel layout**:
  - Left sidebar: Project navigation and recent projects
  - Main content area: SRS generation form
  - Right sidebar: Real-time input analysis panel

### Form Components
1. **Project Name** - Text input for project identification
2. **Project Vision & Core Requirements** - Large textarea (5000 char limit) with character counter
3. **Supporting Documents** - File upload area with drag-and-drop support
4. **Configuration Panel** with:
   - SRS Standard selection (IEEE 830-1998, ISO/IEC/IEEE 29148:2018, etc.)
   - Tone & Detail preferences
   - Output Language selection
   - Auto-detect Actors toggle
   - Risk Analysis toggle

### Analysis Panel
The right sidebar provides real-time feedback:
- Input clarity meter
- Detected items counter (User Roles, Functional Requirements, Key Constraints)
- Real-time suggestions for improvement
- Quick template buttons

### Styling
- Full dark mode support
- Material Symbols icons (Google's icon font)
- Tailwind CSS with custom color scheme
- Smooth transitions and hover effects
- Responsive grid layout

## Access
Navigate to: `http://localhost:3000/new-srs` (or whatever port your dev server is running on)

You can also access it from the home page at `http://localhost:3000` which now has navigation links to:
- **New SRS Project** → `/new-srs` (the new form-based interface)
- **AI Chat** → `/chat` (the existing chat interface)

## Files Created/Modified
- ✅ Created: `/src/app/new-srs/page.tsx` - Main page component
- ✅ Modified: `/src/app/layout.tsx` - Added Material Symbols font
- ✅ Modified: `/src/app/globals.css` - Added icon styling

## Technical Notes
- Uses React hooks for state management (useState)
- Character counter for textarea
- File upload management with delete functionality
- All form controls are fully controlled components
- Accessibility-friendly with proper labels and ARIA attributes

