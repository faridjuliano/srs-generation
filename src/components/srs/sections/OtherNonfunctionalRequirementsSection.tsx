import React from 'react';
import { Section, Subsection } from '../SectionHeading';
import { EditableList } from '../EditableList';

interface OtherNonfunctionalRequirementsProps {
  performanceRequirements?: string[];
  safetyRequirements?: string[];
  securityRequirements?: string[];
  softwareQualityAttributes?: string[];
  isEditing: boolean;
  onUpdatePerformanceRequirements?: (value: string[]) => void;
  onUpdateSafetyRequirements?: (value: string[]) => void;
  onUpdateSecurityRequirements?: (value: string[]) => void;
  onUpdateSoftwareQualityAttributes?: (value: string[]) => void;
}

export const OtherNonfunctionalRequirementsSection: React.FC<OtherNonfunctionalRequirementsProps> = ({
  performanceRequirements = [],
  safetyRequirements = [],
  securityRequirements = [],
  softwareQualityAttributes = [],
  isEditing,
  onUpdatePerformanceRequirements,
  onUpdateSafetyRequirements,
  onUpdateSecurityRequirements,
  onUpdateSoftwareQualityAttributes
}) => {
  const safePerformanceRequirements = Array.isArray(performanceRequirements) ? performanceRequirements : [];
  const safeSafetyRequirements = Array.isArray(safetyRequirements) ? safetyRequirements : [];
  const safeSecurityRequirements = Array.isArray(securityRequirements) ? securityRequirements : [];
  const safeSoftwareQualityAttributes = Array.isArray(softwareQualityAttributes) ? softwareQualityAttributes : [];

  return (
    <Section number="5" title="Other Nonfunctional Requirements">
      {safePerformanceRequirements.length > 0 && (
        <Subsection number="5.1" title="Performance Requirements">
          <EditableList
            items={safePerformanceRequirements}
            onChange={onUpdatePerformanceRequirements || (() => {})}
            isEditing={isEditing}
            buttonLabel="Add Performance Requirement"
          />
        </Subsection>
      )}

      {safeSafetyRequirements.length > 0 && (
        <Subsection number={safePerformanceRequirements.length > 0 ? "5.2" : "5.1"} title="Safety Requirements">
          <EditableList
            items={safeSafetyRequirements}
            onChange={onUpdateSafetyRequirements || (() => {})}
            isEditing={isEditing}
            buttonLabel="Add Safety Requirement"
          />
        </Subsection>
      )}

      {safeSecurityRequirements.length > 0 && (
        <Subsection
          number={`5.${safePerformanceRequirements.length > 0 ? (safeSafetyRequirements.length > 0 ? 3 : 2) : (safeSafetyRequirements.length > 0 ? 2 : 1)}`}
          title="Security Requirements"
        >
          <EditableList
            items={safeSecurityRequirements}
            onChange={onUpdateSecurityRequirements || (() => {})}
            isEditing={isEditing}
            buttonLabel="Add Security Requirement"
          />
        </Subsection>
      )}

      {safeSoftwareQualityAttributes.length > 0 && (
        <Subsection
          number={`5.${safePerformanceRequirements.length + (safeSafetyRequirements.length > 0 ? 1 : 0) + (safeSecurityRequirements.length > 0 ? 1 : 0) + 1}`}
          title="Software Quality Attributes"
        >
          <EditableList
            items={safeSoftwareQualityAttributes}
            onChange={onUpdateSoftwareQualityAttributes || (() => {})}
            isEditing={isEditing}
            buttonLabel="Add Quality Attribute"
          />
        </Subsection>
      )}
    </Section>
  );
};

export default OtherNonfunctionalRequirementsSection;
