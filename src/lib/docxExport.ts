import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

interface EditableContent {
  title?: string;
  introduction?: {
    purpose?: string;
    scope?: string;
    definitions?: string[];
  };
  overallDescription?: {
    productPerspective?: string;
    productFunctions?: string[];
    userCharacteristics?: string[];
    constraints?: string[];
    assumptions?: string[];
  };
  functionalRequirements?: Array<{
    id: string;
    title: string;
    description: string;
    priority: string;
  }>;
  nonFunctionalRequirements?: Array<{
    id: string;
    category: string;
    description: string;
    priority: string;
  }>;
  // Legacy fields
  introduction_purpose?: string;
  introduction_scope?: string;
  introduction_product?: string;
  introduction_conventions?: string;
  introduction_references?: string[];
  product_perspective?: string;
  product_functions?: string[];
  user_characteristics?: string;
  constraints?: string[];
  assumptions_dependencies?: string;
  user_interfaces?: string;
  hardware_interfaces?: string;
  software_interfaces?: string[];
  communication_interfaces?: string;
  system_features?: Array<{
    id: string;
    description: string;
    functional_requirements: string[];
  }>;
  performance_requirements?: string;
  security_requirements?: string;
  software_quality_attributes?: string;
  business_rules?: string[];
}

interface FormData {
  projectName?: string;
  srsStandard?: string;
  toneDetail?: string;
  outputLanguage?: string;
}

interface DocxExportOptions {
  filename?: string;
  content: EditableContent;
  formData?: FormData;
}

export const exportSRSToDocx = async (options: DocxExportOptions) => {
  try {
    const { filename = 'SRS_Document.docx', content, formData } = options;

    const sections: Paragraph[] = [];

    // Title Page
    sections.push(
      new Paragraph({
        text: content.title || `Software Requirements Specification - ${formData?.projectName || 'Project'}`,
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      }),
      new Paragraph({
        text: `Standard: ${formData?.srsStandard || 'IEEE 830-1998'}`,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      }),
      new Paragraph({
        text: `Language: ${formData?.outputLanguage || 'English'}`,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      }),
      new Paragraph({
        text: `Tone: ${formData?.toneDetail || 'Technical & Formal'}`,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      }),
      new Paragraph({ text: '' }) // Page break spacing
    );

    // Check if using new API format
    const isNewFormat = content.title && content.introduction?.purpose;

    if (isNewFormat) {
      // NEW FORMAT
      // 1. Introduction
      sections.push(
        new Paragraph({
          text: '1. Introduction',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 }
        })
      );

      // 1.1 Purpose
      if (content.introduction?.purpose) {
        sections.push(
          new Paragraph({
            text: '1.1 Purpose',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: content.introduction.purpose,
            spacing: { after: 200 }
          })
        );
      }

      // 1.2 Scope
      if (content.introduction?.scope) {
        sections.push(
          new Paragraph({
            text: '1.2 Scope',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: content.introduction.scope,
            spacing: { after: 200 }
          })
        );
      }

      // 1.3 Definitions
      if (content.introduction?.definitions && content.introduction.definitions.length > 0) {
        sections.push(
          new Paragraph({
            text: '1.3 Definitions, Acronyms, and Abbreviations',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          })
        );
        content.introduction.definitions.forEach(def => {
          sections.push(
            new Paragraph({
              text: `• ${def}`,
              spacing: { after: 100 }
            })
          );
        });
      }

      // 2. Overall Description
      sections.push(
        new Paragraph({
          text: '2. Overall Description',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 }
        })
      );

      // 2.1 Product Perspective
      if (content.overallDescription?.productPerspective) {
        sections.push(
          new Paragraph({
            text: '2.1 Product Perspective',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: content.overallDescription.productPerspective,
            spacing: { after: 200 }
          })
        );
      }

      // 2.2 Product Functions
      if (content.overallDescription?.productFunctions && content.overallDescription.productFunctions.length > 0) {
        sections.push(
          new Paragraph({
            text: '2.2 Product Functions',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          })
        );
        content.overallDescription.productFunctions.forEach(func => {
          sections.push(
            new Paragraph({
              text: `• ${func}`,
              spacing: { after: 100 }
            })
          );
        });
      }

      // 2.3 User Characteristics
      if (content.overallDescription?.userCharacteristics && content.overallDescription.userCharacteristics.length > 0) {
        sections.push(
          new Paragraph({
            text: '2.3 User Characteristics',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          })
        );
        content.overallDescription.userCharacteristics.forEach(char => {
          sections.push(
            new Paragraph({
              text: `• ${char}`,
              spacing: { after: 100 }
            })
          );
        });
      }

      // 2.4 Constraints
      if (content.overallDescription?.constraints && content.overallDescription.constraints.length > 0) {
        sections.push(
          new Paragraph({
            text: '2.4 Constraints',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          })
        );
        content.overallDescription.constraints.forEach(constraint => {
          sections.push(
            new Paragraph({
              text: `• ${constraint}`,
              spacing: { after: 100 }
            })
          );
        });
      }

      // 2.5 Assumptions and Dependencies
      if (content.overallDescription?.assumptions && content.overallDescription.assumptions.length > 0) {
        sections.push(
          new Paragraph({
            text: '2.5 Assumptions and Dependencies',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          })
        );
        content.overallDescription.assumptions.forEach(assumption => {
          sections.push(
            new Paragraph({
              text: `• ${assumption}`,
              spacing: { after: 100 }
            })
          );
        });
      }

      // 3. Functional Requirements
      if (content.functionalRequirements && content.functionalRequirements.length > 0) {
        sections.push(
          new Paragraph({
            text: '3. System Requirements',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            text: '3.1 Functional Requirements',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          })
        );

        content.functionalRequirements.forEach(req => {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${req.id}: `,
                  bold: true
                }),
                new TextRun({
                  text: req.title,
                  bold: true
                }),
                new TextRun({
                  text: ` [${req.priority}]`,
                  italics: true
                })
              ],
              spacing: { before: 150, after: 50 }
            }),
            new Paragraph({
              text: req.description,
              spacing: { after: 200 }
            })
          );
        });
      }

      // 4. Non-Functional Requirements
      if (content.nonFunctionalRequirements && content.nonFunctionalRequirements.length > 0) {
        sections.push(
          new Paragraph({
            text: '4. Non-Functional Requirements',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          })
        );

        // Group by category
        const grouped = content.nonFunctionalRequirements.reduce((acc, req) => {
          if (!acc[req.category]) {
            acc[req.category] = [];
          }
          acc[req.category].push(req);
          return acc;
        }, {} as Record<string, typeof content.nonFunctionalRequirements>);

        let categoryIndex = 1;
        Object.entries(grouped).forEach(([category, reqs]) => {
          sections.push(
            new Paragraph({
              text: `4.${categoryIndex} ${category}`,
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 }
            })
          );

          reqs.forEach(req => {
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${req.id}: `,
                    bold: true
                  }),
                  new TextRun({
                    text: ` [${req.priority}]`,
                    italics: true
                  })
                ],
                spacing: { before: 150, after: 50 }
              }),
              new Paragraph({
                text: req.description,
                spacing: { after: 200 }
              })
            );
          });

          categoryIndex++;
        });
      }
    } else {
      // LEGACY FORMAT
      // Similar structure but using legacy fields
      sections.push(
        new Paragraph({
          text: '1. Introduction',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 }
        })
      );

      if (content.introduction_purpose) {
        sections.push(
          new Paragraph({
            text: '1.1 Purpose',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: content.introduction_purpose,
            spacing: { after: 200 }
          })
        );
      }

      if (content.introduction_scope) {
        sections.push(
          new Paragraph({
            text: '1.2 Scope',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: content.introduction_scope,
            spacing: { after: 200 }
          })
        );
      }

      // Add more legacy sections as needed...
    }

    // Create the document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: sections
        }
      ]
    });

    // Generate and save the document
    const blob = await Packer.toBlob(doc);
    saveAs(blob, filename);
  } catch (error) {
    console.error('Error exporting DOCX:', error);
    throw error;
  }
};

export default exportSRSToDocx;

