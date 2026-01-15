import React from 'react';
import { Section, Subsection } from '../SectionHeading';
import { EditableText } from '../EditableText';
import { EditableList } from '../EditableList';

interface NonFunctionalRequirementsProps {
  performanceRequirements: string;
  securityRequirements: string;
  softwareQualityAttributes: string;
  businessRules: string[];
  isEditing: boolean;
  onUpdatePerformanceRequirements: (value: string) => void;
  onUpdateSecurityRequirements: (value: string) => void;
  onUpdateSoftwareQualityAttributes: (value: string) => void;
  onUpdateBusinessRules: (value: string[]) => void;
}

export const NonFunctionalRequirementsSection: React.FC<NonFunctionalRequirementsProps> = ({
  performanceRequirements,
  securityRequirements,
  softwareQualityAttributes,
  businessRules,
  isEditing,
  onUpdatePerformanceRequirements,
  onUpdateSecurityRequirements,
  onUpdateSoftwareQualityAttributes,
  onUpdateBusinessRules
}) => {
  return (
    <Section number="5" title="Other Non-Functional Requirements">
      <Subsection number="5.1" title="Performance Requirements">
        <EditableText
          value={performanceRequirements}
          onChange={onUpdatePerformanceRequirements}
          isEditing={isEditing}
          rows={4}
        />
      </Subsection>

      <Subsection number="5.2" title="Security Requirements">
        <EditableText
          value={securityRequirements}
          onChange={onUpdateSecurityRequirements}
          isEditing={isEditing}
          rows={4}
        />
      </Subsection>

      <Subsection number="5.3" title="Software Quality Attributes">
        <EditableText
          value={softwareQualityAttributes}
          onChange={onUpdateSoftwareQualityAttributes}
          isEditing={isEditing}
          rows={4}
        />
      </Subsection>

      <Subsection number="5.4" title="Business Rules">
        <EditableList
          items={businessRules}
          onChange={onUpdateBusinessRules}
          isEditing={isEditing}
          buttonLabel="Add Rule"
        />
      </Subsection>
    </Section>
  );
};

export default NonFunctionalRequirementsSection;

