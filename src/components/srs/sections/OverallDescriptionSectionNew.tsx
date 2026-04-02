import React from 'react';
import { Section, Subsection } from '../SectionHeading';
import { EditableText } from '../EditableText';
import { EditableList } from '../EditableList';

type ListItemLike = string | {
  id?: string;
  name?: string;
  description?: string;
  technicalLevel?: string;
  [key: string]: unknown;
};

function normalizeListItem(item: unknown): string {
  if (typeof item === 'string') return item;
  if (!item || typeof item !== 'object') return '';

  const record = item as Record<string, unknown>;
  const name = typeof record.name === 'string' ? record.name.trim() : '';
  const description = typeof record.description === 'string' ? record.description.trim() : '';
  const technicalLevel = typeof record.technicalLevel === 'string' ? record.technicalLevel.trim() : '';

  const main = [name, description].filter(Boolean).join(' - ');
  if (main) {
    return technicalLevel ? `${main} (${technicalLevel})` : main;
  }

  return typeof record.id === 'string' ? record.id : '';
}

interface OverallDescriptionSectionNewProps {
  productPerspective?: string;
  productFunctions?: string[];
  userCharacteristics?: ListItemLike[];
  constraints?: string[];
  assumptions?: string[];
  // New API format fields
  userClassesAndCharacteristics?: ListItemLike[];
  operatingEnvironment?: string;
  designAndImplementationConstraints?: string[];
  assumptionsAndDependencies?: string[];
  isEditing: boolean;
  onUpdateProductPerspective?: (value: string) => void;
  onUpdateProductFunctions?: (value: string[]) => void;
  onUpdateUserCharacteristics?: (value: string[]) => void;
  onUpdateConstraints?: (value: string[]) => void;
  onUpdateAssumptions?: (value: string[]) => void;
  // New API format handlers
  onUpdateUserClassesAndCharacteristics?: (value: string[]) => void;
  onUpdateOperatingEnvironment?: (value: string) => void;
  onUpdateDesignAndImplementationConstraints?: (value: string[]) => void;
  onUpdateAssumptionsAndDependencies?: (value: string[]) => void;
}

export const OverallDescriptionSectionNew: React.FC<OverallDescriptionSectionNewProps> = ({
  productPerspective = '',
  productFunctions = [],
  userCharacteristics = [],
  constraints = [],
  assumptions = [],
  // New API format fields
  userClassesAndCharacteristics = [],
  operatingEnvironment = '',
  designAndImplementationConstraints = [],
  assumptionsAndDependencies = [],
  isEditing,
  onUpdateProductPerspective,
  onUpdateProductFunctions,
  onUpdateUserCharacteristics,
  onUpdateConstraints,
  onUpdateAssumptions,
  // New API format handlers
  onUpdateUserClassesAndCharacteristics,
  onUpdateOperatingEnvironment,
  onUpdateDesignAndImplementationConstraints,
  onUpdateAssumptionsAndDependencies
}) => {
  const safeProductFunctions = Array.isArray(productFunctions) ? productFunctions : [];
  const safeUserCharacteristics = Array.isArray(userCharacteristics)
    ? userCharacteristics.map(normalizeListItem).filter(Boolean)
    : [];
  const safeConstraints = Array.isArray(constraints) ? constraints : [];
  const safeAssumptions = Array.isArray(assumptions) ? assumptions : [];

  // New API format
  const safeUserClassesAndCharacteristics = Array.isArray(userClassesAndCharacteristics)
    ? userClassesAndCharacteristics.map(normalizeListItem).filter(Boolean)
    : [];
  const safeDesignAndImplementationConstraints = Array.isArray(designAndImplementationConstraints) ? designAndImplementationConstraints : [];
  const safeAssumptionsAndDependencies = Array.isArray(assumptionsAndDependencies) ? assumptionsAndDependencies : [];

  // Determine which format to use
  const isNewFormat = safeUserClassesAndCharacteristics.length > 0 || operatingEnvironment || safeDesignAndImplementationConstraints.length > 0 || safeAssumptionsAndDependencies.length > 0;

  if (isNewFormat) {
    // Render new API format
    return (
      <Section number="2" title="Overall Description">
        <Subsection number="2.1" title="User Classes and Characteristics">
          <EditableList
            items={safeUserClassesAndCharacteristics}
            onChange={onUpdateUserClassesAndCharacteristics || (() => {})}
            isEditing={isEditing}
            buttonLabel="Add User Class"
          />
        </Subsection>

        <Subsection number="2.2" title="Operating Environment">
          <EditableText
            value={operatingEnvironment}
            onChange={onUpdateOperatingEnvironment || (() => {})}
            isEditing={isEditing}
            rows={4}
          />
        </Subsection>

        <Subsection number="2.3" title="Design and Implementation Constraints">
          <EditableList
            items={safeDesignAndImplementationConstraints}
            onChange={onUpdateDesignAndImplementationConstraints || (() => {})}
            isEditing={isEditing}
            buttonLabel="Add Constraint"
          />
        </Subsection>

        <Subsection number="2.4" title="Assumptions and Dependencies">
          <EditableList
            items={safeAssumptionsAndDependencies}
            onChange={onUpdateAssumptionsAndDependencies || (() => {})}
            isEditing={isEditing}
            buttonLabel="Add Assumption"
          />
        </Subsection>
      </Section>
    );
  }

  // Render legacy format
  return (
    <Section number="2" title="Overall Description">
      <Subsection number="2.1" title="Product Perspective">
        <EditableText
          value={productPerspective}
          onChange={onUpdateProductPerspective || (() => {})}
          isEditing={isEditing}
          rows={4}
        />
      </Subsection>

      <Subsection number="2.2" title="Product Functions">
        <EditableList
          items={safeProductFunctions}
          onChange={onUpdateProductFunctions || (() => {})}
          isEditing={isEditing}
          buttonLabel="Add Function"
        />
      </Subsection>

      <Subsection number="2.3" title="User Characteristics">
        <EditableList
          items={safeUserCharacteristics}
          onChange={onUpdateUserCharacteristics || (() => {})}
          isEditing={isEditing}
          buttonLabel="Add User Characteristic"
        />
      </Subsection>

      <Subsection number="2.4" title="Constraints">
        <EditableList
          items={safeConstraints}
          onChange={onUpdateConstraints || (() => {})}
          isEditing={isEditing}
          buttonLabel="Add Constraint"
        />
      </Subsection>

      <Subsection number="2.5" title="Assumptions and Dependencies">
        <EditableList
          items={safeAssumptions}
          onChange={onUpdateAssumptions || (() => {})}
          isEditing={isEditing}
          buttonLabel="Add Assumption"
        />
      </Subsection>
    </Section>
  );
};

export default OverallDescriptionSectionNew;

