import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

interface EditableContent {
  title?: string;
  introduction?: {
    purpose?: string;
    scope?: string;
    definitions?: string[];
    references?: string[];
  };
  overallDescription?: {
    userClassesAndCharacteristics?: string[];
    operatingEnvironment?: string;
    designAndImplementationConstraints?: string[];
    assumptionsAndDependencies?: string[];
    // Legacy fields
    productPerspective?: string;
    productFunctions?: string[];
    userCharacteristics?: string[];
    constraints?: string[];
    assumptions?: string[];
  };
  externalInterfaceRequirements?: {
    userInterfaces?: string;
    hardwareInterfaces?: string;
    softwareInterfaces?: string[];
    communicationInterfaces?: string;
  };
  systemUseCases?: Array<{
    name: string;
    identifier: string;
    description: string;
    actors: string[];
    preconditions: string;
    mainFlow: string[];
    alternativeFlow: string[];
  }>;
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
  otherNonfunctionalRequirements?: {
    performanceRequirements?: string[];
    safetyRequirements?: string[];
    securityRequirements?: string[];
    softwareQualityAttributes?: string[];
  };
  otherRequirements?: string;
  systemRequirementsChart?: string;
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
  uploadedFiles?: string[];
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

    // Small helpers to reduce repetition
    const addHeading = (text: string, level: HeadingLevel) => {
      sections.push(new Paragraph({
        text,
        heading: level,
        spacing: level === HeadingLevel.HEADING_1 ? { before: 400, after: 200 } : { before: 200, after: 100 }
      }));
    };

    const addText = (text?: string, spacingAfter = 200) => {
      if (!text) return;
      sections.push(new Paragraph({ text, spacing: { after: spacingAfter } }));
    };

    const addList = (items?: string[], spacingAfter = 100) => {
      if (!items || items.length === 0) return;
      items.filter(Boolean).forEach(item => {
        sections.push(new Paragraph({ text: `• ${item}`, spacing: { after: spacingAfter } }));
      });
    };

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
      new Paragraph({ text: '' })
    );

    const isNewFormat = content.title && content.introduction?.purpose;
    let sectionIndex = 1;

    if (isNewFormat) {
      // NEW FORMAT: mirror on-screen ordering
      addHeading(`${sectionIndex}. Introduction`, HeadingLevel.HEADING_1);
      addHeading(`${sectionIndex}.1 Purpose`, HeadingLevel.HEADING_2);
      addText(content.introduction?.purpose);
      if (content.introduction?.scope) {
        addHeading(`${sectionIndex}.2 Scope`, HeadingLevel.HEADING_2);
        addText(content.introduction.scope);
      }
      if (content.introduction?.definitions?.length) {
        addHeading(`${sectionIndex}.3 Definitions, Acronyms, and Abbreviations`, HeadingLevel.HEADING_2);
        addList(content.introduction.definitions);
      }
      if (content.introduction?.references?.length) {
        addHeading(`${sectionIndex}.4 References`, HeadingLevel.HEADING_2);
        addList(content.introduction.references);
      }

      sectionIndex++;
      addHeading(`${sectionIndex}. Overall Description`, HeadingLevel.HEADING_1);
      addHeading(`${sectionIndex}.1 User Classes and Characteristics`, HeadingLevel.HEADING_2);
      addList(content.overallDescription?.userClassesAndCharacteristics);
      addHeading(`${sectionIndex}.2 Operating Environment`, HeadingLevel.HEADING_2);
      addText(content.overallDescription?.operatingEnvironment);
      if (content.overallDescription?.designAndImplementationConstraints?.length) {
        addHeading(`${sectionIndex}.3 Design and Implementation Constraints`, HeadingLevel.HEADING_2);
        addList(content.overallDescription.designAndImplementationConstraints);
      }
      if (content.overallDescription?.assumptionsAndDependencies?.length) {
        addHeading(`${sectionIndex}.4 Assumptions and Dependencies`, HeadingLevel.HEADING_2);
        addList(content.overallDescription.assumptionsAndDependencies);
      }
      if (content.overallDescription?.productPerspective) {
        addHeading(`${sectionIndex}.5 Product Perspective`, HeadingLevel.HEADING_2);
        addText(content.overallDescription.productPerspective);
      }
      if (content.overallDescription?.productFunctions?.length) {
        addHeading(`${sectionIndex}.6 Product Functions`, HeadingLevel.HEADING_2);
        addList(content.overallDescription.productFunctions);
      }
      if (content.overallDescription?.userCharacteristics?.length) {
        addHeading(`${sectionIndex}.7 User Characteristics`, HeadingLevel.HEADING_2);
        addList(content.overallDescription.userCharacteristics);
      }
      if (content.overallDescription?.constraints?.length) {
        addHeading(`${sectionIndex}.8 Constraints`, HeadingLevel.HEADING_2);
        addList(content.overallDescription.constraints);
      }
      if (content.overallDescription?.assumptions?.length) {
        addHeading(`${sectionIndex}.9 Assumptions`, HeadingLevel.HEADING_2);
        addList(content.overallDescription.assumptions);
      }

      sectionIndex++;
      addHeading(`${sectionIndex}. External Interface Requirements`, HeadingLevel.HEADING_1);
      addHeading(`${sectionIndex}.1 User Interfaces`, HeadingLevel.HEADING_2);
      addText(content.externalInterfaceRequirements?.userInterfaces);
      addHeading(`${sectionIndex}.2 Hardware Interfaces`, HeadingLevel.HEADING_2);
      addText(content.externalInterfaceRequirements?.hardwareInterfaces);
      if (content.externalInterfaceRequirements?.softwareInterfaces?.length) {
        addHeading(`${sectionIndex}.3 Software Interfaces`, HeadingLevel.HEADING_2);
        addList(content.externalInterfaceRequirements.softwareInterfaces);
      }
      addHeading(`${sectionIndex}.4 Communication Interfaces`, HeadingLevel.HEADING_2);
      addText(content.externalInterfaceRequirements?.communicationInterfaces);

      sectionIndex++;
      if (content.functionalRequirements?.length) {
        addHeading(`${sectionIndex}. Functional Requirements`, HeadingLevel.HEADING_1);
        content.functionalRequirements.forEach(req => {
          sections.push(new Paragraph({
            children: [
              new TextRun({ text: `${req.id}: `, bold: true }),
              new TextRun({ text: req.title, bold: true }),
              new TextRun({ text: ` [${req.priority}]`, italics: true })
            ],
            spacing: { before: 150, after: 50 }
          }));
          addText(req.description);
        });
      }

      sectionIndex++;
      if (content.nonFunctionalRequirements?.length) {
        addHeading(`${sectionIndex}. Non-Functional Requirements`, HeadingLevel.HEADING_1);
        const grouped = content.nonFunctionalRequirements.reduce((acc, req) => {
          acc[req.category] = acc[req.category] || [];
          acc[req.category].push(req);
          return acc;
        }, {} as Record<string, typeof content.nonFunctionalRequirements>);

        let categoryIndex = 1;
        Object.entries(grouped).forEach(([category, reqs]) => {
          addHeading(`${sectionIndex}.${categoryIndex} ${category}`, HeadingLevel.HEADING_2);
          reqs.forEach(req => {
            sections.push(new Paragraph({
              children: [
                new TextRun({ text: `${req.id}: `, bold: true }),
                new TextRun({ text: ` [${req.priority}]`, italics: true })
              ],
              spacing: { before: 150, after: 50 }
            }));
            addText(req.description);
          });
          categoryIndex++;
        });
      }

      sectionIndex++;
      if (content.systemUseCases?.length) {
        addHeading(`${sectionIndex}. System Use Cases`, HeadingLevel.HEADING_1);
        content.systemUseCases.forEach((uc, idx) => {
          addHeading(`${sectionIndex}.${idx + 1} ${uc.name} (${uc.identifier})`, HeadingLevel.HEADING_2);
          addText(`Description: ${uc.description}`);
          addList(uc.actors?.map(actor => `Actor: ${actor}`));
          addText(`Preconditions: ${uc.preconditions}`);
          if (uc.mainFlow?.length) {
            addHeading('Main Flow', HeadingLevel.HEADING_3);
            addList(uc.mainFlow);
          }
          if (uc.alternativeFlow?.length) {
            addHeading('Alternative Flow', HeadingLevel.HEADING_3);
            addList(uc.alternativeFlow);
          }
        });
      }

      sectionIndex++;
      if (content.otherNonfunctionalRequirements) {
        addHeading(`${sectionIndex}. Other Nonfunctional Requirements`, HeadingLevel.HEADING_1);
        addHeading(`${sectionIndex}.1 Performance Requirements`, HeadingLevel.HEADING_2);
        addList(content.otherNonfunctionalRequirements.performanceRequirements);
        addHeading(`${sectionIndex}.2 Safety Requirements`, HeadingLevel.HEADING_2);
        addList(content.otherNonfunctionalRequirements.safetyRequirements);
        addHeading(`${sectionIndex}.3 Security Requirements`, HeadingLevel.HEADING_2);
        addList(content.otherNonfunctionalRequirements.securityRequirements);
        addHeading(`${sectionIndex}.4 Software Quality Attributes`, HeadingLevel.HEADING_2);
        addList(content.otherNonfunctionalRequirements.softwareQualityAttributes);
      }

      if (content.otherRequirements) {
        sectionIndex++;
        addHeading(`${sectionIndex}. Other Requirements`, HeadingLevel.HEADING_1);
        addText(content.otherRequirements);
      }

      if (content.systemRequirementsChart) {
        sectionIndex++;
        addHeading(`${sectionIndex}. System Requirements Chart`, HeadingLevel.HEADING_1);
        addText(content.systemRequirementsChart);
      }
    } else {
      // LEGACY FORMAT: mirror legacy UI ordering
      addHeading(`${sectionIndex}. Introduction`, HeadingLevel.HEADING_1);
      addHeading(`${sectionIndex}.1 Purpose`, HeadingLevel.HEADING_2);
      addText(content.introduction_purpose);
      addHeading(`${sectionIndex}.2 Scope`, HeadingLevel.HEADING_2);
      addText(content.introduction_scope);
      if (content.introduction_product) {
        addHeading(`${sectionIndex}.3 Product Overview`, HeadingLevel.HEADING_2);
        addText(content.introduction_product);
      }
      if (content.introduction_conventions) {
        addHeading(`${sectionIndex}.4 Document Conventions`, HeadingLevel.HEADING_2);
        addText(content.introduction_conventions);
      }
      if (content.introduction_references?.length) {
        addHeading(`${sectionIndex}.5 References`, HeadingLevel.HEADING_2);
        addList(content.introduction_references);
      }

      sectionIndex++;
      addHeading(`${sectionIndex}. Overall Description`, HeadingLevel.HEADING_1);
      addHeading(`${sectionIndex}.1 Product Perspective`, HeadingLevel.HEADING_2);
      addText(content.product_perspective);
      addHeading(`${sectionIndex}.2 Product Functions`, HeadingLevel.HEADING_2);
      addList(content.product_functions);
      addHeading(`${sectionIndex}.3 User Characteristics`, HeadingLevel.HEADING_2);
      addText(content.user_characteristics);
      addHeading(`${sectionIndex}.4 Constraints`, HeadingLevel.HEADING_2);
      addList(content.constraints);
      addHeading(`${sectionIndex}.5 Assumptions and Dependencies`, HeadingLevel.HEADING_2);
      addText(content.assumptions_dependencies);

      sectionIndex++;
      addHeading(`${sectionIndex}. External Interface Requirements`, HeadingLevel.HEADING_1);
      addHeading(`${sectionIndex}.1 User Interfaces`, HeadingLevel.HEADING_2);
      addText(content.user_interfaces);
      addHeading(`${sectionIndex}.2 Hardware Interfaces`, HeadingLevel.HEADING_2);
      addText(content.hardware_interfaces);
      if (content.software_interfaces?.length) {
        addHeading(`${sectionIndex}.3 Software Interfaces`, HeadingLevel.HEADING_2);
        addList(content.software_interfaces);
      }
      addHeading(`${sectionIndex}.4 Communication Interfaces`, HeadingLevel.HEADING_2);
      addText(content.communication_interfaces);

      sectionIndex++;
      if (content.system_features?.length) {
        addHeading(`${sectionIndex}. System Features`, HeadingLevel.HEADING_1);
        content.system_features.forEach((feature, idx) => {
          addHeading(`${sectionIndex}.${idx + 1} ${feature.id}`, HeadingLevel.HEADING_2);
          addText(feature.description);
          if (feature.functional_requirements?.length) {
            addList(feature.functional_requirements);
          }
        });
      }

      sectionIndex++;
      addHeading(`${sectionIndex}. Non-Functional Requirements`, HeadingLevel.HEADING_1);
      addHeading(`${sectionIndex}.1 Performance Requirements`, HeadingLevel.HEADING_2);
      addText(content.performance_requirements);
      addHeading(`${sectionIndex}.2 Security Requirements`, HeadingLevel.HEADING_2);
      addText(content.security_requirements);
      addHeading(`${sectionIndex}.3 Software Quality Attributes`, HeadingLevel.HEADING_2);
      addText(content.software_quality_attributes);
      if (content.business_rules?.length) {
        addHeading(`${sectionIndex}.4 Business Rules`, HeadingLevel.HEADING_2);
        addList(content.business_rules);
      }
    }

    // Appendices (shared)
    sectionIndex++;
    addHeading(`${sectionIndex}. Appendices`, HeadingLevel.HEADING_1);
    addText(`SRS Standard: ${formData?.srsStandard || 'N/A'}`);
    addText(`Tone & Detail: ${formData?.toneDetail || 'N/A'}`);
    addText(`Output Language: ${formData?.outputLanguage || 'N/A'}`);
    if (formData?.uploadedFiles?.length) {
      addHeading('Uploaded Files', HeadingLevel.HEADING_2);
      addList(formData.uploadedFiles);
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

