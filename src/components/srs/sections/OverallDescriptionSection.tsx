import React from 'react';
import { Section, Subsection } from '../SectionHeading';
import { EditableText } from '../EditableText';
import { EditableList } from '../EditableList';

interface OverallDescriptionSectionProps {
  perspective: string;
  functions: string[];
  userCharacteristics: string;
  constraints: string[];
  assumptionsDependencies: string;
  isEditing: boolean;
  onUpdatePerspective: (value: string) => void;
  onUpdateFunctions: (value: string[]) => void;
  onUpdateUserCharacteristics: (value: string) => void;
  onUpdateConstraints: (value: string[]) => void;
  onUpdateAssumptionsDependencies: (value: string) => void;
}

export const OverallDescriptionSection: React.FC<OverallDescriptionSectionProps> = ({
  perspective,
  functions,
  userCharacteristics,
  constraints,
  assumptionsDependencies,
  isEditing,
  onUpdatePerspective,
  onUpdateFunctions,
  onUpdateUserCharacteristics,
  onUpdateConstraints,
  onUpdateAssumptionsDependencies
}) => {
  return (
    <Section number="2" title="Overall Description">
      <Subsection number="2.1" title="Product Perspective">
        <EditableText
          value={perspective}
          onChange={onUpdatePerspective}
          isEditing={isEditing}
          rows={4}
        />
      </Subsection>

      <Subsection number="2.2" title="Product Functions">
        <EditableList
          items={functions}
          onChange={onUpdateFunctions}
          isEditing={isEditing}
          buttonLabel="Add Function"
        />
      </Subsection>

      <Subsection number="2.3" title="User Characteristics">
        <EditableText
          value={userCharacteristics}
          onChange={onUpdateUserCharacteristics}
          isEditing={isEditing}
          rows={4}
        />
      </Subsection>

      <Subsection number="2.4" title="Constraints">
        <EditableList
          items={constraints}
          onChange={onUpdateConstraints}
          isEditing={isEditing}
          buttonLabel="Add Constraint"
        />
      </Subsection>

      <Subsection number="2.5" title="Assumptions and Dependencies">
        <EditableText
          value={assumptionsDependencies}
          onChange={onUpdateAssumptionsDependencies}
          isEditing={isEditing}
          rows={4}
        />
      </Subsection>
    </Section>
  );
};

export default OverallDescriptionSection;

