import React from 'react';
import { Section, Subsection } from '../SectionHeading';
import { EditableText } from '../EditableText';
import { EditableList } from '../EditableList';

interface IntroductionSectionNewProps {
  purpose: string;
  scope?: string;
  definitions?: string[];
  references?: string[];
  isEditing: boolean;
  onUpdatePurpose: (value: string) => void;
  onUpdateScope?: (value: string) => void;
  onUpdateDefinitions?: (value: string[]) => void;
  onUpdateReferences?: (value: string[]) => void;
}

export const IntroductionSectionNew: React.FC<IntroductionSectionNewProps> = ({
  purpose = '',
  scope = '',
  definitions = [],
  references = [],
  isEditing,
  onUpdatePurpose,
  onUpdateScope,
  onUpdateDefinitions,
  onUpdateReferences
}) => {
  const safeDefinitions = Array.isArray(definitions) ? definitions : [];
  const safeReferences = Array.isArray(references) ? references : [];
  const hasReferences = safeReferences.length > 0;
  const hasDefinitions = safeDefinitions.length > 0;

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

      {scope && (
        <Subsection number="1.2" title="Scope">
          <EditableText
            value={scope}
            onChange={onUpdateScope || (() => {})}
            isEditing={isEditing}
            rows={4}
          />
        </Subsection>
      )}

      {hasReferences && (
        <Subsection number={scope ? "1.3" : "1.2"} title="References">
          <EditableList
            items={safeReferences}
            onChange={onUpdateReferences || (() => {})}
            isEditing={isEditing}
            buttonLabel="Add Reference"
          />
        </Subsection>
      )}

      {hasDefinitions && (
        <Subsection number={scope ? (hasReferences ? "1.4" : "1.3") : (hasReferences ? "1.3" : "1.2")} title="Definitions, Acronyms, and Abbreviations">
          <EditableList
            items={safeDefinitions}
            onChange={onUpdateDefinitions || (() => {})}
            isEditing={isEditing}
            buttonLabel="Add Definition"
          />
        </Subsection>
      )}
    </Section>
  );
};

export default IntroductionSectionNew;

