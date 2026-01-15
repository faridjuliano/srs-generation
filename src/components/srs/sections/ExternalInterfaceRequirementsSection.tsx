import React from 'react';
import { Section, Subsection } from '../SectionHeading';
import { EditableText } from '../EditableText';
import { EditableList } from '../EditableList';

interface ExternalInterfaceRequirementsProps {
  userInterfaces: string;
  hardwareInterfaces: string;
  softwareInterfaces: string[];
  communicationInterfaces: string;
  isEditing: boolean;
  onUpdateUserInterfaces: (value: string) => void;
  onUpdateHardwareInterfaces: (value: string) => void;
  onUpdateSoftwareInterfaces: (value: string[]) => void;
  onUpdateCommunicationInterfaces: (value: string) => void;
}

export const ExternalInterfaceRequirementsSection: React.FC<ExternalInterfaceRequirementsProps> = ({
  userInterfaces,
  hardwareInterfaces,
  softwareInterfaces,
  communicationInterfaces,
  isEditing,
  onUpdateUserInterfaces,
  onUpdateHardwareInterfaces,
  onUpdateSoftwareInterfaces,
  onUpdateCommunicationInterfaces
}) => {
  return (
    <Section number="3" title="External Interface Requirements">
      <Subsection number="3.1" title="User Interfaces">
        <EditableText
          value={userInterfaces}
          onChange={onUpdateUserInterfaces}
          isEditing={isEditing}
          rows={4}
        />
      </Subsection>

      <Subsection number="3.2" title="Hardware Interfaces">
        <EditableText
          value={hardwareInterfaces}
          onChange={onUpdateHardwareInterfaces}
          isEditing={isEditing}
          rows={4}
        />
      </Subsection>

      <Subsection number="3.3" title="Software Interfaces">
        <EditableList
          items={softwareInterfaces}
          onChange={onUpdateSoftwareInterfaces}
          isEditing={isEditing}
          buttonLabel="Add Interface"
        />
      </Subsection>

      <Subsection number="3.4" title="Communication Interfaces">
        <EditableText
          value={communicationInterfaces}
          onChange={onUpdateCommunicationInterfaces}
          isEditing={isEditing}
          rows={4}
        />
      </Subsection>
    </Section>
  );
};

export default ExternalInterfaceRequirementsSection;

