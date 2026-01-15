import React from 'react';
import { Section, Subsection } from '../SectionHeading';
import { MetadataGrid } from '../MetadataCard';

interface AppendicesSectionProps {
  srsStandard: string;
  toneDetail: string;
  outputLanguage: string;
  uploadedFiles: string[];
}

export const AppendicesSection: React.FC<AppendicesSectionProps> = ({
  srsStandard,
  toneDetail,
  outputLanguage,
  uploadedFiles
}) => {
  const metadataItems = [
    { label: 'SRS Standard Used', value: srsStandard },
    { label: 'Tone & Detail Level', value: toneDetail },
    { label: 'Output Language', value: outputLanguage },
    {
      label: 'Generated',
      value: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  ];

  return (
    <Section number="6" title="Appendices" withBorder={false}>
      <Subsection number="A" title="Document Metadata">
        <MetadataGrid items={metadataItems} columns={2} />
      </Subsection>

      {uploadedFiles && uploadedFiles.length > 0 && (
        <Subsection number="B" title="Reference Documents">
          <div className="space-y-2 lg:space-y-3">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 lg:gap-3 p-2 lg:p-3 bg-slate-50 dark:bg-[#202434] rounded-lg border border-slate-200 dark:border-slate-700"
              >
                <span className="material-symbols-outlined text-sm text-slate-400 flex-shrink-0">
                  description
                </span>
                <span className="text-sm lg:text-base text-slate-600 dark:text-slate-300 font-medium truncate">
                  {file}
                </span>
              </div>
            ))}
          </div>
        </Subsection>
      )}
    </Section>
  );
};

export default AppendicesSection;

