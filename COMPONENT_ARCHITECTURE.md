# SRS Component Refactoring - Architecture Guide

## Overview
The SRS Results page has been refactored into a modular, reusable component architecture. This document describes the component structure and how to use them.

## Component Structure

```
src/components/srs/
├── EditableText.tsx              # Reusable editable text field
├── EditableList.tsx              # Reusable editable list items
├── SectionHeading.tsx            # Section and subsection heading components
├── SystemFeature.tsx             # Individual system feature card
├── MetadataCard.tsx              # Metadata display cards
├── ActionButton.tsx              # Action buttons and button groups
├── DocumentHeader.tsx            # Document header with project info
├── Sidebar.tsx                   # Reusable sidebar component
├── sections/
│   ├── IntroductionSection.tsx
│   ├── OverallDescriptionSection.tsx
│   ├── ExternalInterfaceRequirementsSection.tsx
│   ├── SystemFeaturesSection.tsx
│   ├── NonFunctionalRequirementsSection.tsx
│   └── AppendicesSection.tsx
└── layout/
    ├── LeftSidebarContent.tsx
    └── RightSidebarContent.tsx
```

## Core Components

### 1. EditableText
**Purpose**: Render editable or read-only text content

**Props**:
- `value: string` - The text content
- `onChange: (value: string) => void` - Callback when text changes
- `isEditing: boolean` - Toggle between edit and view modes
- `rows?: number` - Number of textarea rows (default: 4)
- `className?: string` - Additional CSS classes

**Usage**:
```tsx
<EditableText
  value={content}
  onChange={(val) => setContent(val)}
  isEditing={isEditing}
  rows={5}
/>
```

### 2. EditableList
**Purpose**: Render editable or read-only list items with add/remove capabilities

**Props**:
- `items: string[]` - Array of list items
- `onChange: (items: string[]) => void` - Callback when items change
- `isEditing: boolean` - Toggle between edit and view modes
- `buttonLabel?: string` - Label for add button (default: "Add Item")
- `onAddItem?: () => void` - Custom add handler
- `onRemoveItem?: (index: number) => void` - Custom remove handler

**Usage**:
```tsx
<EditableList
  items={requirements}
  onChange={(items) => setRequirements(items)}
  isEditing={isEditing}
  buttonLabel="Add Requirement"
/>
```

### 3. SectionHeading / Section / Subsection
**Purpose**: Consistent section hierarchy and styling

**Components**:
- `SectionHeading`: Just the heading
- `Section`: Complete section with border and spacing
- `Subsection`: Subsection without border

**Usage**:
```tsx
<Section number="1" title="Introduction">
  <Subsection number="1.1" title="Purpose">
    {/* content */}
  </Subsection>
</Section>
```

### 4. SystemFeature
**Purpose**: Render a single system feature with editable description and requirements

**Props**:
- `id: string` - Feature ID (e.g., "F1")
- `description: string` - Feature description
- `functionalRequirements: string[]` - List of requirements
- `isEditing: boolean` - Toggle edit mode
- `onUpdateDescription: (value: string) => void` - Callback for description changes
- `onUpdateRequirements: (requirements: string[]) => void` - Callback for requirements changes

**Usage**:
```tsx
<SystemFeature
  id="F1"
  description="User Management"
  functionalRequirements={requirements}
  isEditing={isEditing}
  onUpdateDescription={(desc) => updateFeature({...feature, description: desc})}
  onUpdateRequirements={(reqs) => updateFeature({...feature, functional_requirements: reqs})}
/>
```

### 5. MetadataCard / MetadataGrid
**Purpose**: Display key-value metadata in styled cards

**Components**:
- `MetadataCard`: Single card
- `MetadataGrid`: Multiple cards in responsive grid

**Usage**:
```tsx
<MetadataGrid
  items={[
    { label: 'SRS Standard', value: 'IEEE 830-1998' },
    { label: 'Language', value: 'English (US)' }
  ]}
  columns={2}
/>
```

### 6. ActionButton / ActionButtonGroup
**Purpose**: Consistent action buttons with variants

**Props**:
- `icon: string` - Material icon name
- `label: string` - Button label
- `onClick?: () => void` - Click handler
- `variant?: 'primary' | 'secondary'` - Button style
- `disabled?: boolean` - Disabled state

**Usage**:
```tsx
<ActionButtonGroup
  buttons={[
    { icon: 'download', label: 'Download', variant: 'secondary' },
    { icon: 'save', label: 'Save', variant: 'primary', onClick: handleSave }
  ]}
/>
```

### 7. DocumentHeader
**Purpose**: Render document title and action buttons

**Props**:
- `projectName: string`
- `srsStandard: string`
- `toneDetail: string`
- `outputLanguage: string`
- `isEditing: boolean`
- `onEditToggle: () => void`

### 8. Sidebar
**Purpose**: Reusable sidebar wrapper for left/right sidebars

**Props**:
- `isOpen: boolean` - Open/closed state
- `onClose: () => void` - Callback when closing
- `position?: 'left' | 'right'` - Sidebar position
- `children: React.ReactNode` - Sidebar content

## Section Components

### IntroductionSection
Combines editable text and list components for the Introduction section (1.1-1.4).

### OverallDescriptionSection
Combines multiple editable fields for the Overall Description section (2.1-2.5).

### ExternalInterfaceRequirementsSection
Renders interface requirements section (3.1-3.4).

### SystemFeaturesSection
Renders system features with embedded SystemFeature components.

### NonFunctionalRequirementsSection
Renders non-functional requirements (5.1-5.4).

### AppendicesSection
Renders appendices with metadata grid and reference documents.

## Layout Components

### LeftSidebarContent
Renders the left navigation sidebar (project list, settings, help).

### RightSidebarContent
Renders the right info panel (document stats, actions, timestamp).

## Main Page Structure

The `/srs-results/page.tsx` now uses:

1. **State Management**:
   - `isEditing`: Toggle edit mode
   - `isSidebarOpen`: Mobile sidebar visibility
   - `isInfoPanelOpen`: Mobile info panel visibility
   - `editableContent`: All document content
   - `formData`: Original form data

2. **Component Composition**:
   ```tsx
   <Sidebar position="left">
     <LeftSidebarContent />
   </Sidebar>
   
   <main>
     <header>Navigation</header>
     <DocumentHeader />
     <IntroductionSection />
     <OverallDescriptionSection />
     <ExternalInterfaceRequirementsSection />
     <SystemFeaturesSection />
     <NonFunctionalRequirementsSection />
     <AppendicesSection />
   </main>
   
   <Sidebar position="right">
     <RightSidebarContent />
   </Sidebar>
   ```

## Reusability Examples

### Example 1: Adding a new text section
```tsx
<Subsection number="2.6" title="New Section">
  <EditableText
    value={newField}
    onChange={(val) => setEditableContent({...editableContent, newField: val})}
    isEditing={isEditing}
  />
</Subsection>
```

### Example 2: Adding a new list section
```tsx
<Subsection number="3.5" title="New List Section">
  <EditableList
    items={newItems}
    onChange={(items) => setEditableContent({...editableContent, newItems: items})}
    isEditing={isEditing}
    buttonLabel="Add Item"
  />
</Subsection>
```

### Example 3: Reusing in another page
```tsx
import EditableText from '@/components/srs/EditableText';
import { Section, Subsection } from '@/components/srs/SectionHeading';

export function MyComponent() {
  return (
    <Section number="1" title="My Section">
      <Subsection number="1.1" title="Subsection">
        <EditableText value={...} onChange={...} isEditing={...} />
      </Subsection>
    </Section>
  );
}
```

## Benefits of This Architecture

1. **Modularity**: Each component has a single responsibility
2. **Reusability**: Components can be used across multiple pages
3. **Maintainability**: Changes to a component affect all usages
4. **Testability**: Smaller components are easier to test
5. **Consistency**: Design patterns are enforced across the app
6. **Scalability**: Easy to add new sections or features
7. **Type Safety**: Full TypeScript support with proper interfaces

## Future Improvements

- Extract state management into a custom hook
- Add component composition utilities
- Create a Storybook for component documentation
- Implement undo/redo functionality
- Add form validation
- Create a component library documentation site

