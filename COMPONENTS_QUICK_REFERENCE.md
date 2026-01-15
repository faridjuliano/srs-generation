# SRS Components - Quick Reference Guide

## All Components at a Glance

### Core Components

#### EditableText
**File**: `src/components/srs/EditableText.tsx`  
**Export**: `EditableText`  
**Use**: Editable text field with view/edit toggle

```tsx
import EditableText from '@/components/srs/EditableText';

<EditableText
  value={text}
  onChange={setText}
  isEditing={isEditing}
  rows={4}
/>
```

#### EditableList
**File**: `src/components/srs/EditableList.tsx`  
**Export**: `EditableList`  
**Use**: Editable list with add/remove functionality

```tsx
import EditableList from '@/components/srs/EditableList';

<EditableList
  items={items}
  onChange={setItems}
  isEditing={isEditing}
  buttonLabel="Add Item"
/>
```

#### SectionHeading
**File**: `src/components/srs/SectionHeading.tsx`  
**Exports**: `SectionHeading`, `Section`, `Subsection`  
**Use**: Document section structure

```tsx
import { Section, Subsection } from '@/components/srs/SectionHeading';

<Section number="1" title="Introduction">
  <Subsection number="1.1" title="Purpose">
    {/* content */}
  </Subsection>
</Section>
```

#### SystemFeature
**File**: `src/components/srs/SystemFeature.tsx`  
**Export**: `SystemFeature`  
**Use**: Individual system feature card

```tsx
import SystemFeature from '@/components/srs/SystemFeature';

<SystemFeature
  id="F1"
  description="Feature Name"
  functionalRequirements={requirements}
  isEditing={isEditing}
  onUpdateDescription={handleDesc}
  onUpdateRequirements={handleReqs}
/>
```

#### MetadataCard
**File**: `src/components/srs/MetadataCard.tsx`  
**Exports**: `MetadataCard`, `MetadataGrid`  
**Use**: Key-value metadata display

```tsx
import { MetadataGrid } from '@/components/srs/MetadataCard';

<MetadataGrid
  items={[
    { label: 'Standard', value: 'IEEE 830' },
    { label: 'Language', value: 'English' }
  ]}
  columns={2}
/>
```

#### ActionButton
**File**: `src/components/srs/ActionButton.tsx`  
**Exports**: `DocumentActionButton`, `ActionButtonGroup`  
**Use**: Styled action buttons

```tsx
import { ActionButtonGroup } from '@/components/srs/ActionButton';

<ActionButtonGroup
  buttons={[
    { icon: 'download', label: 'Download', variant: 'secondary' },
    { icon: 'save', label: 'Save', variant: 'primary' }
  ]}
/>
```

#### DocumentHeader
**File**: `src/components/srs/DocumentHeader.tsx`  
**Export**: `DocumentHeader`  
**Use**: Document title and controls

```tsx
import DocumentHeader from '@/components/srs/DocumentHeader';

<DocumentHeader
  projectName={name}
  srsStandard={standard}
  toneDetail={tone}
  outputLanguage={language}
  isEditing={isEditing}
  onEditToggle={toggleEdit}
/>
```

#### Sidebar
**File**: `src/components/srs/Sidebar.tsx`  
**Export**: `Sidebar`  
**Use**: Reusable sidebar container

```tsx
import Sidebar from '@/components/srs/Sidebar';

<Sidebar
  isOpen={isOpen}
  onClose={handleClose}
  position="left"
>
  <Content />
</Sidebar>
```

---

### Section Components

#### IntroductionSection
**File**: `src/components/srs/sections/IntroductionSection.tsx`  
**Export**: `IntroductionSection`  
**Covers**: Sections 1.1-1.4 (Purpose, Scope, Product, Conventions, References)

```tsx
import IntroductionSection from '@/components/srs/sections/IntroductionSection';

<IntroductionSection
  purpose={content.introduction_purpose}
  scope={content.introduction_scope}
  product={content.introduction_product}
  conventions={content.introduction_conventions}
  references={content.introduction_references}
  isEditing={isEditing}
  onUpdatePurpose={handleUpdate}
  onUpdateScope={handleUpdate}
  // ... other handlers
/>
```

#### OverallDescriptionSection
**File**: `src/components/srs/sections/OverallDescriptionSection.tsx`  
**Export**: `OverallDescriptionSection`  
**Covers**: Sections 2.1-2.5 (Perspective, Functions, Characteristics, Constraints, Assumptions)

#### ExternalInterfaceRequirementsSection
**File**: `src/components/srs/sections/ExternalInterfaceRequirementsSection.tsx`  
**Export**: `ExternalInterfaceRequirementsSection`  
**Covers**: Sections 3.1-3.4 (User, Hardware, Software, Communication Interfaces)

#### SystemFeaturesSection
**File**: `src/components/srs/sections/SystemFeaturesSection.tsx`  
**Export**: `SystemFeaturesSection`  
**Covers**: Section 4 (System Features with individual feature cards)

#### NonFunctionalRequirementsSection
**File**: `src/components/srs/sections/NonFunctionalRequirementsSection.tsx`  
**Export**: `NonFunctionalRequirementsSection`  
**Covers**: Sections 5.1-5.4 (Performance, Security, Quality, Business Rules)

#### AppendicesSection
**File**: `src/components/srs/sections/AppendicesSection.tsx`  
**Export**: `AppendicesSection`  
**Covers**: Section 6 (Metadata and Reference Documents)

---

### Layout Components

#### LeftSidebarContent
**File**: `src/components/srs/layout/LeftSidebarContent.tsx`  
**Export**: `LeftSidebarContent`  
**Use**: Navigation sidebar content (projects, settings, help)

```tsx
import LeftSidebarContent from '@/components/srs/layout/LeftSidebarContent';

<LeftSidebarContent
  projectName={name}
  router={router}
/>
```

#### RightSidebarContent
**File**: `src/components/srs/layout/RightSidebarContent.tsx`  
**Export**: `RightSidebarContent`  
**Use**: Info panel content (stats, actions, timestamp)

```tsx
import RightSidebarContent from '@/components/srs/layout/RightSidebarContent';

<RightSidebarContent onClose={handleClose} />
```

---

## Import Examples

### Import All Needed Components
```tsx
// Core components
import EditableText from '@/components/srs/EditableText';
import EditableList from '@/components/srs/EditableList';
import { Section, Subsection, SectionHeading } from '@/components/srs/SectionHeading';
import SystemFeature from '@/components/srs/SystemFeature';
import { MetadataCard, MetadataGrid } from '@/components/srs/MetadataCard';
import { DocumentActionButton, ActionButtonGroup } from '@/components/srs/ActionButton';
import DocumentHeader from '@/components/srs/DocumentHeader';
import Sidebar from '@/components/srs/Sidebar';

// Section components
import IntroductionSection from '@/components/srs/sections/IntroductionSection';
import OverallDescriptionSection from '@/components/srs/sections/OverallDescriptionSection';
import ExternalInterfaceRequirementsSection from '@/components/srs/sections/ExternalInterfaceRequirementsSection';
import SystemFeaturesSection from '@/components/srs/sections/SystemFeaturesSection';
import NonFunctionalRequirementsSection from '@/components/srs/sections/NonFunctionalRequirementsSection';
import AppendicesSection from '@/components/srs/sections/AppendicesSection';

// Layout components
import LeftSidebarContent from '@/components/srs/layout/LeftSidebarContent';
import RightSidebarContent from '@/components/srs/layout/RightSidebarContent';
```

---

## Component Usage Patterns

### Pattern 1: Editable Text Field
```tsx
<Subsection number="1.1" title="Purpose">
  <EditableText
    value={content.purpose}
    onChange={(val) => setContent({...content, purpose: val})}
    isEditing={isEditing}
    rows={4}
  />
</Subsection>
```

### Pattern 2: Editable List
```tsx
<Subsection number="2.2" title="Functions">
  <EditableList
    items={content.functions}
    onChange={(items) => setContent({...content, functions: items})}
    isEditing={isEditing}
    buttonLabel="Add Function"
  />
</Subsection>
```

### Pattern 3: Metadata Display
```tsx
<MetadataGrid
  items={[
    { label: 'SRS Standard', value: formData.srsStandard },
    { label: 'Language', value: formData.outputLanguage },
    { label: 'Generated', value: new Date().toLocaleDateString() }
  ]}
/>
```

### Pattern 4: Section with Multiple Subsections
```tsx
<Section number="2" title="Overall Description">
  <Subsection number="2.1" title="Perspective">
    <EditableText {...props} />
  </Subsection>
  <Subsection number="2.2" title="Functions">
    <EditableList {...props} />
  </Subsection>
</Section>
```

---

## Component Dependencies

- **EditableText**: No dependencies
- **EditableList**: No dependencies
- **SectionHeading**: No dependencies
- **SystemFeature**: No dependencies
- **MetadataCard**: No dependencies
- **ActionButton**: No dependencies
- **DocumentHeader**: No dependencies
- **Sidebar**: No dependencies
- **Section components**: Depend on core components
- **Layout components**: No dependencies

---

## Total Component Count

| Type | Count |
|------|-------|
| Core Components | 8 |
| Section Components | 6 |
| Layout Components | 2 |
| **Total** | **16** |

---

## File Sizes

| File | Lines | Type |
|------|-------|------|
| EditableText.tsx | ~30 | Core |
| EditableList.tsx | ~70 | Core |
| SectionHeading.tsx | ~60 | Core |
| SystemFeature.tsx | ~100 | Core |
| MetadataCard.tsx | ~50 | Core |
| ActionButton.tsx | ~50 | Core |
| DocumentHeader.tsx | ~60 | Core |
| Sidebar.tsx | ~50 | Core |
| Section components | ~500 | Sections |
| Layout components | ~200 | Layout |
| **srs-results/page.tsx** | **~350** | Main |
| **Total new code** | **~1500** | Total |

**Note**: Refactored from a single 1000+ line file into 16 focused, reusable components!

---

Generated: January 15, 2026

