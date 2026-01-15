import React from 'react';
import { Section } from '../SectionHeading';
import SystemFeature from '../SystemFeature';

interface SystemFeaturesSectionProps {
  features: Array<{
    id: string;
    description: string;
    functional_requirements: string[];
  }>;
  isEditing: boolean;
  onUpdateFeature: (index: number, feature: any) => void;
}

export const SystemFeaturesSection: React.FC<SystemFeaturesSectionProps> = ({
  features,
  isEditing,
  onUpdateFeature
}) => {
  return (
    <Section number="4" title="System Features">
      {features.map((feature, index) => (
        <SystemFeature
          key={feature.id}
          id={feature.id}
          description={feature.description}
          functionalRequirements={feature.functional_requirements}
          isEditing={isEditing}
          onUpdateDescription={(newDescription) => {
            onUpdateFeature(index, {
              ...feature,
              description: newDescription
            });
          }}
          onUpdateRequirements={(newRequirements) => {
            onUpdateFeature(index, {
              ...feature,
              functional_requirements: newRequirements
            });
          }}
        />
      ))}
    </Section>
  );
};

export default SystemFeaturesSection;

