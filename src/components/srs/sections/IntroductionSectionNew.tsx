import React from 'react';
import { Section, Subsection } from '../SectionHeading';
import { EditableText } from '../EditableText';
import { EditableList } from '../EditableList';

interface IntroductionSectionNewProps {
  purpose: string;
  scope: string;
  definitions: string[];
  isEditing: boolean;
  onUpdatePurpose: (value: string) => void;
  onUpdateScope: (value: string) => void;
  onUpdateDefinitions: (value: string[]) => void;
}

export const IntroductionSectionNew: React.FC<IntroductionSectionNewProps> = ({
  purpose = '',
  scope = '',
  definitions = [],
  isEditing,
  onUpdatePurpose,
  onUpdateScope,
  onUpdateDefinitions
}) => {
  const safeDefinitions = Array.isArray(definitions) ? definitions : [];

  return (
    <Section number="1" title="Introduction">
      <Subsection number="1.1" title="Purpose">
        <EditableText
          value={purpose}
          onChange={onUpdatePurpose}
          isEditing={isEditing}
          rows={4}
        />
      </Subsection>

      <Subsection number="1.2" title="Scope">
        <EditableText
          value={scope}
          onChange={onUpdateScope}
          isEditing={isEditing}
          rows={4}
        />
      </Subsection>

      <Subsection number="1.3" title="Definitions, Acronyms, and Abbreviations">
        <EditableList
          items={safeDefinitions}
          onChange={onUpdateDefinitions}
          isEditing={isEditing}
          buttonLabel="Add Definition"
        />
      </Subsection>
    </Section>
  );
};

export default IntroductionSectionNew;

