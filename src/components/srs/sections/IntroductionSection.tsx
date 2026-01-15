import React from 'react';
import { Section, Subsection } from '../SectionHeading';
import { EditableText } from '../EditableText';
import { EditableList } from '../EditableList';

interface IntroductionSectionProps {
  purpose: string;
  scope: string;
  product: string;
  conventions: string;
  references: string[];
  isEditing: boolean;
  onUpdatePurpose: (value: string) => void;
  onUpdateScope: (value: string) => void;
  onUpdateProduct: (value: string) => void;
  onUpdateConventions: (value: string) => void;
  onUpdateReferences: (value: string[]) => void;
}

export const IntroductionSection: React.FC<IntroductionSectionProps> = ({
  purpose,
  scope,
  product,
  conventions,
  references,
  isEditing,
  onUpdatePurpose,
  onUpdateScope,
  onUpdateProduct,
  onUpdateConventions,
  onUpdateReferences
}) => {
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

      <Subsection number="1.3" title="Product Overview">
        <EditableText
          value={product}
          onChange={onUpdateProduct}
          isEditing={isEditing}
          rows={4}
        />
      </Subsection>

      <Subsection number="1.4" title="Document Conventions and References">
        {isEditing && (
          <>
            <EditableText
              value={conventions}
              onChange={onUpdateConventions}
              isEditing={isEditing}
              rows={2}
              className="mb-3"
            />
            <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">References</h4>
          </>
        )}
        <EditableList
          items={references}
          onChange={onUpdateReferences}
          isEditing={isEditing}
          buttonLabel="Add Reference"
        />
        {!isEditing && (
          <p className="text-sm lg:text-base text-slate-600 dark:text-slate-400 leading-relaxed mb-3 mt-3">
            {conventions}
          </p>
        )}
      </Subsection>
    </Section>
  );
};

export default IntroductionSection;

