import React from 'react';
import { Section, Subsection } from '../SectionHeading';
import { EditableText } from '../EditableText';
import { EditableList } from '../EditableList';

interface OverallDescriptionSectionNewProps {
  productPerspective: string;
  productFunctions: string[];
  userCharacteristics: string[];
  constraints: string[];
  assumptions: string[];
  isEditing: boolean;
  onUpdateProductPerspective: (value: string) => void;
  onUpdateProductFunctions: (value: string[]) => void;
  onUpdateUserCharacteristics: (value: string[]) => void;
  onUpdateConstraints: (value: string[]) => void;
  onUpdateAssumptions: (value: string[]) => void;
}

export const OverallDescriptionSectionNew: React.FC<OverallDescriptionSectionNewProps> = ({
  productPerspective = '',
  productFunctions = [],
  userCharacteristics = [],
  constraints = [],
  assumptions = [],
  isEditing,
  onUpdateProductPerspective,
  onUpdateProductFunctions,
  onUpdateUserCharacteristics,
  onUpdateConstraints,
  onUpdateAssumptions
}) => {
  const safeProductFunctions = Array.isArray(productFunctions) ? productFunctions : [];
  const safeUserCharacteristics = Array.isArray(userCharacteristics) ? userCharacteristics : [];
  const safeConstraints = Array.isArray(constraints) ? constraints : [];
  const safeAssumptions = Array.isArray(assumptions) ? assumptions : [];

  return (
    <Section number="2" title="Overall Description">
      <Subsection number="2.1" title="Product Perspective">
        <EditableText
          value={productPerspective}
          onChange={onUpdateProductPerspective}
          isEditing={isEditing}
          rows={4}
        />
      </Subsection>

      <Subsection number="2.2" title="Product Functions">
        <EditableList
          items={safeProductFunctions}
          onChange={onUpdateProductFunctions}
          isEditing={isEditing}
          buttonLabel="Add Function"
        />
      </Subsection>

      <Subsection number="2.3" title="User Characteristics">
        <EditableList
          items={safeUserCharacteristics}
          onChange={onUpdateUserCharacteristics}
          isEditing={isEditing}
          buttonLabel="Add User Characteristic"
        />
      </Subsection>

      <Subsection number="2.4" title="Constraints">
        <EditableList
          items={safeConstraints}
          onChange={onUpdateConstraints}
          isEditing={isEditing}
          buttonLabel="Add Constraint"
        />
      </Subsection>

      <Subsection number="2.5" title="Assumptions and Dependencies">
        <EditableList
          items={safeAssumptions}
          onChange={onUpdateAssumptions}
          isEditing={isEditing}
          buttonLabel="Add Assumption"
        />
      </Subsection>
    </Section>
  );
};

export default OverallDescriptionSectionNew;

