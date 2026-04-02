"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DocumentHeader from '@/components/srs/DocumentHeader';
import Sidebar from '@/components/srs/Sidebar';
import LeftSidebarContent from '@/components/srs/layout/LeftSidebarContent';
import RightSidebarContent from '@/components/srs/layout/RightSidebarContent';
import ChatSidebar from '@/components/srs/ChatSidebar';
import IntroductionSection from '@/components/srs/sections/IntroductionSection';
import IntroductionSectionNew from '@/components/srs/sections/IntroductionSectionNew';
import OverallDescriptionSection from '@/components/srs/sections/OverallDescriptionSection';
import OverallDescriptionSectionNew from '@/components/srs/sections/OverallDescriptionSectionNew';
import ExternalInterfaceRequirementsSection from '@/components/srs/sections/ExternalInterfaceRequirementsSection';
import SystemFeaturesSection from '@/components/srs/sections/SystemFeaturesSection';
import SystemUseCasesSection from '@/components/srs/sections/SystemUseCasesSection';
import FunctionalRequirementsSection from '@/components/srs/sections/FunctionalRequirementsSection';
import NonFunctionalRequirementsSection from '@/components/srs/sections/NonFunctionalRequirementsSection';
import NonFunctionalRequirementsSectionNew from '@/components/srs/sections/NonFunctionalRequirementsSectionNew';
import OtherNonfunctionalRequirementsSection from '@/components/srs/sections/OtherNonfunctionalRequirementsSection';
import AppendicesSection from '@/components/srs/sections/AppendicesSection';
import { exportSRSToDocx } from '@/lib/docxExport';
import { generateSRSFromTemplate } from '@/lib/srsTemplateGenerator';

interface FormData {
  projectName: string;
  projectVision: string;
  srsStandard: string;
  uploadedFiles: string[];
}

interface EditableContent {
  title: string;
  // New API Format 1: With introduction containing purpose and references
  introduction?: {
    purpose: string;
    references?: string[];
    scope?: string;
    definitions?: string[];
  };
  overallDescription?: {
    userClassesAndCharacteristics?: string[];
    operatingEnvironment?: string;
    designAndImplementationConstraints?: string[];
    assumptionsAndDependencies?: string[];
    // Legacy format support
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
  // Legacy fields for backwards compatibility
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

export default function SRSResultsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(false);
  const [isChatboxOpen, setIsChatboxOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'done'>('idle');
  const [editableContent, setEditableContent] = useState<EditableContent>({
    title: '',
    introduction: {
      purpose: '',
      scope: '',
      definitions: []
    },
    overallDescription: {
      productPerspective: '',
      productFunctions: [],
      userCharacteristics: [],
      constraints: [],
      assumptions: []
    },
    functionalRequirements: [],
    nonFunctionalRequirements: [],
    // Legacy fields for backwards compatibility
    introduction_purpose: '',
    introduction_scope: '',
    introduction_product: '',
    introduction_conventions: 'This document follows the conventions defined in ISO/IEC/IEEE 29148:2018.',
    introduction_references: [
      'ISO/IEC/IEEE 29148:2018 - Systems and software engineering',
      'IEEE 830-1998 - Software Requirements Specifications',
      'Project charter and business requirements'
    ],
    product_perspective: '',
    product_functions: [
      'User authentication and authorization',
      'Data management and persistence',
      'Reporting and analytics',
      'System administration and configuration'
    ],
    user_characteristics: 'Users include system administrators, end users, and external integrations. Skill levels vary from novice to expert.',
    constraints: [
      'Must comply with data protection regulations',
      'Performance must meet response time SLAs',
      'System must be compatible with existing infrastructure'
    ],
    assumptions_dependencies: 'The system depends on reliable network connectivity and assumes users have standard web browsers.',
    user_interfaces: 'Web-based responsive user interface supporting modern browsers. Mobile-optimized design for on-the-go access.',
    hardware_interfaces: 'Compatible with standard x86/x64 servers and cloud infrastructure (AWS, Azure, GCP).',
    software_interfaces: [
      'REST API for third-party integrations',
      'Database: PostgreSQL/MySQL compatible',
      'Message queue: RabbitMQ/Kafka compatible',
      'Authentication: OAuth 2.0 / SAML 2.0'
    ],
    communication_interfaces: 'HTTPS/TLS 1.2+ for all communications. Supports JSON and XML message formats.',
    system_features: [
      {
        id: 'F1',
        description: 'User Management & Authentication',
        functional_requirements: [
          'System shall support user registration and account creation',
          'System shall authenticate users using secure mechanisms',
          'System shall maintain user session state',
          'System shall support role-based access control (RBAC)'
        ]
      }
    ],
    performance_requirements: 'System must respond to user requests within 200ms for standard operations. Peak load capacity of 10,000 concurrent users. Database queries must complete within 5 seconds.',
    security_requirements: 'All data must be encrypted in transit (TLS 1.2+) and at rest (AES-256). Multi-factor authentication required for privileged accounts. Regular security audits and penetration testing mandatory.',
    software_quality_attributes: 'System must achieve 99.9% uptime. Code coverage must exceed 80%. Mean time to recovery (MTTR) should not exceed 1 hour.',
    business_rules: [
      'Users must accept terms and conditions before account creation',
      'Data retention policy: 7 years for financial records',
      'Audit logging required for all system transactions',
      'Service level agreement (SLA) guarantees 99.9% availability'
    ]
  });

  useEffect(() => {
    try {
      // Load generated data from localStorage
      const generatedData = localStorage.getItem('srs-generated');

      if (generatedData) {
        const parsedData = JSON.parse(generatedData);
        setFormData(parsedData);

        // If we have generated content from the API, use it
        if (parsedData.generatedContent) {
          const content = parsedData.generatedContent;

          // Check if it's the new API format with title, introduction, overallDescription, etc.
          if (content.title && content.introduction && content.overallDescription) {
            // New API format - merge with defaults to ensure all fields exist
            setEditableContent(prev => ({
              ...prev,
              ...content,
              // Ensure critical arrays exist even if empty
              functionalRequirements: content.functionalRequirements || [],
              nonFunctionalRequirements: content.nonFunctionalRequirements || [],
              systemUseCases: content.systemUseCases || [],
              introduction: {
                purpose: content.introduction?.purpose || '',
                references: content.introduction?.references || [],
                scope: content.introduction?.scope,
                definitions: content.introduction?.definitions
              },
              overallDescription: {
                ...content.overallDescription
              },
              externalInterfaceRequirements: content.externalInterfaceRequirements || {
                userInterfaces: '',
                hardwareInterfaces: '',
                softwareInterfaces: [],
                communicationInterfaces: ''
              },
              otherNonfunctionalRequirements: content.otherNonfunctionalRequirements || {
                performanceRequirements: [],
                safetyRequirements: [],
                securityRequirements: [],
                softwareQualityAttributes: []
              }
            }));
          } else if (content.title && content.introduction?.purpose) {
            // Also new format - merge with defaults
            setEditableContent(prev => ({
              ...prev,
              ...content,
              // Ensure critical arrays exist even if empty
              functionalRequirements: content.functionalRequirements || [],
              nonFunctionalRequirements: content.nonFunctionalRequirements || [],
              systemUseCases: content.systemUseCases || [],
              introduction: {
                purpose: content.introduction?.purpose || '',
                references: content.introduction?.references || [],
                scope: content.introduction?.scope,
                definitions: content.introduction?.definitions
              },
              overallDescription: {
                ...prev.overallDescription,
                ...content.overallDescription
              },
              externalInterfaceRequirements: content.externalInterfaceRequirements || {
                userInterfaces: '',
                hardwareInterfaces: '',
                softwareInterfaces: [],
                communicationInterfaces: ''
              },
              otherNonfunctionalRequirements: content.otherNonfunctionalRequirements || {
                performanceRequirements: [],
                safetyRequirements: [],
                securityRequirements: [],
                softwareQualityAttributes: []
              }
            }));
          } else {
            // Legacy format - map to new structure
            setEditableContent(prev => ({
              ...prev,
              title: content.title || prev.title,
              introduction: {
                purpose: content.introduction?.purpose || content.introduction_purpose || prev.introduction?.purpose || '',
                references: content.introduction?.references || content.introduction?.definitions || content.introduction_references || prev.introduction?.references || [],
                scope: content.introduction?.scope || content.introduction_scope || prev.introduction?.scope || '',
                definitions: content.introduction?.definitions || prev.introduction?.definitions || []
              },
              overallDescription: {
                userClassesAndCharacteristics: content.overallDescription?.userClassesAndCharacteristics || (Array.isArray(content.overallDescription?.userCharacteristics) ? content.overallDescription.userCharacteristics : [content.overallDescription?.userCharacteristics || '']),
                operatingEnvironment: content.overallDescription?.operatingEnvironment || '',
                designAndImplementationConstraints: content.overallDescription?.designAndImplementationConstraints || content.overallDescription?.constraints || [],
                assumptionsAndDependencies: content.overallDescription?.assumptionsAndDependencies || (Array.isArray(content.overallDescription?.assumptions) ? content.overallDescription.assumptions : []),
                // Also set legacy fields
                productPerspective: content.overallDescription?.productPerspective || content.product_perspective || prev.overallDescription?.productPerspective || '',
                productFunctions: content.overallDescription?.productFunctions || content.product_functions || prev.overallDescription?.productFunctions || [],
                userCharacteristics: content.overallDescription?.userCharacteristics || [],
                constraints: content.overallDescription?.constraints || prev.overallDescription?.constraints || [],
                assumptions: content.overallDescription?.assumptions || prev.overallDescription?.assumptions || []
              },
              externalInterfaceRequirements: content.externalInterfaceRequirements || {
                userInterfaces: content.user_interfaces || '',
                hardwareInterfaces: content.hardware_interfaces || '',
                softwareInterfaces: content.software_interfaces || [],
                communicationInterfaces: content.communication_interfaces || ''
              },
              systemUseCases: content.systemUseCases || [],
              functionalRequirements: content.functionalRequirements || [],
              nonFunctionalRequirements: content.nonFunctionalRequirements || [],
              otherNonfunctionalRequirements: content.otherNonfunctionalRequirements || {
                performanceRequirements: [],
                safetyRequirements: [],
                securityRequirements: [],
                softwareQualityAttributes: []
              },
              otherRequirements: content.otherRequirements || '',
              systemRequirementsChart: content.systemRequirementsChart || '',
              // Legacy fields
              introduction_purpose: content.introduction?.purpose || content.introduction_purpose || prev.introduction_purpose || '',
              introduction_scope: content.introduction?.scope || content.introduction_scope || prev.introduction_scope || '',
              introduction_product: content.introduction_product || prev.introduction_product || '',
              introduction_references: content.introduction?.references || content.introduction?.definitions || content.introduction_references || prev.introduction_references || [],
              product_perspective: content.overallDescription?.productPerspective || content.product_perspective || prev.product_perspective || '',
              product_functions: content.overallDescription?.productFunctions || content.product_functions || prev.product_functions || [],
              user_characteristics: content.overallDescription?.userCharacteristics && Array.isArray(content.overallDescription.userCharacteristics)
                ? content.overallDescription.userCharacteristics.join(', ')
                : content.user_characteristics || prev.user_characteristics || '',
              constraints: content.overallDescription?.constraints || content.constraints || prev.constraints || [],
              assumptions_dependencies: content.overallDescription?.assumptions && Array.isArray(content.overallDescription.assumptions)
                ? content.overallDescription.assumptions.join(', ')
                : content.assumptions_dependencies || prev.assumptions_dependencies || '',
              user_interfaces: content.externalInterfaceRequirements?.userInterfaces || content.user_interfaces || prev.user_interfaces || '',
              hardware_interfaces: content.externalInterfaceRequirements?.hardwareInterfaces || content.hardware_interfaces || prev.hardware_interfaces || '',
              software_interfaces: content.externalInterfaceRequirements?.softwareInterfaces || content.software_interfaces || prev.software_interfaces || [],
              communication_interfaces: content.externalInterfaceRequirements?.communicationInterfaces || content.communication_interfaces || prev.communication_interfaces || ''
            }));
          }
        } else {
          // No generated content - use template generator to create SRS from form data
          try {
            const generatedSRS = generateSRSFromTemplate({
              projectName: parsedData.projectName || 'Unnamed Project',
              projectVision: parsedData.projectVision || 'Project vision not provided',
              srsStandard: parsedData.srsStandard || 'IEEE 830-1998',
              uploadedFiles: parsedData.uploadedFiles || []
            });

            setEditableContent(generatedSRS as EditableContent);

            // Also save the generated content to localStorage
            const updatedData = {
              ...parsedData,
              generatedContent: generatedSRS,
              lastModified: new Date().toISOString()
            };
            localStorage.setItem('srs-generated', JSON.stringify(updatedData));
          } catch (templateError) {
            console.error('Failed to generate SRS from template:', templateError);
            // Fall back to default template content
          }
        }
      } else {
        console.warn('No generated SRS data found in localStorage');
      }
    } catch (error) {
      console.error('Failed to load SRS data from localStorage:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-save editableContent to localStorage whenever it changes
  useEffect(() => {
    if (!loading && formData) {
      try {
        const updatedData = {
          ...formData,
          generatedContent: editableContent,
          lastModified: new Date().toISOString()
        };
        localStorage.setItem('srs-generated', JSON.stringify(updatedData));
      } catch (error) {
        console.error('Failed to save SRS data to localStorage:', error);
      }
    }
  }, [editableContent, formData, loading]);

  const handleSaveDraft = async () => {
    try {
      setSaveStatus('saving');

      // Simulate a slight delay for UX feedback
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedData = {
        ...formData,
        generatedContent: editableContent,
        lastModified: new Date().toISOString(),
        savedAt: new Date().toISOString()
      };

      localStorage.setItem('srs-generated', JSON.stringify(updatedData));
      localStorage.setItem('srs-draft', JSON.stringify(updatedData));

      // Update recent projects with latest save time
      try {
        const stored = localStorage.getItem('srs-recent-projects');
        const projects = stored ? JSON.parse(stored) : [];

        const projectIndex = projects.findIndex((p: any) => p.projectName === formData?.projectName);
        if (projectIndex > -1) {
          projects[projectIndex].savedAt = new Date().toISOString();
          localStorage.setItem('srs-recent-projects', JSON.stringify(projects));
        }
      } catch (error) {
        console.error('Failed to update recent projects:', error);
      }

      setSaveStatus('saved');

      // Reset status after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save draft:', error);
      setSaveStatus('idle');
    }
  };

  const handleExportDocx = async () => {
    try {
      setExportStatus('exporting');
      const date = new Date().toISOString().split('T')[0];
      const projectNameForFile = (formData?.projectName || 'SRS Document')
        .replace(/[^a-zA-Z0-9-_]/g, '_')
        .toLowerCase();
      const filename = `${projectNameForFile}_${date}.docx`;

      await exportSRSToDocx({
        filename,
        content: editableContent,
        formData: formData || undefined
      });

      setExportStatus('done');
      setTimeout(() => setExportStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to export DOCX:', error);
      setExportStatus('idle');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to export DOCX: ${errorMessage}\n\nPlease try again. If the problem persists, try refreshing the page.`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <div className="mb-4">
            <span className="material-symbols-outlined text-primary text-5xl animate-spin">refresh</span>
          </div>
          <p className="text-slate-600 dark:text-slate-400">Generating SRS Document...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden flex-col lg:flex-row">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-[#161926] rounded-lg shadow-lg border border-slate-200 dark:border-slate-700"
      >
        <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">
          {isSidebarOpen ? 'close' : 'menu'}
        </span>
      </button>

      {/* Left Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        projectName={formData?.projectName || ''}
        router={router}
        position="left"
      >
        <LeftSidebarContent projectName={formData?.projectName || ''} router={router} />
      </Sidebar>

      {/* Main Content */}
      <main className="flex flex-col flex-1 h-full min-w-0 bg-background-light dark:bg-background-dark overflow-hidden relative w-full">
        <header className="h-14 lg:h-16 flex items-center justify-between px-3 lg:px-8 bg-white dark:bg-[#161926] border-b border-[#e7e9f3] dark:border-[#2a2e3b] flex-shrink-0 z-10 gap-2">
          <nav className="flex text-xs lg:text-sm text-slate-500 dark:text-slate-400 ml-14 lg:ml-0 flex-1 truncate">
            <a className="hover:text-primary hidden sm:inline" href="#">Projects</a>
            <span className="mx-1 lg:mx-2 hidden sm:inline">/</span>
            <span className="text-slate-900 dark:text-white font-medium truncate text-xs lg:text-sm">{formData?.projectName || 'SRS Document'}</span>
            <span className="mx-1 lg:mx-2 hidden md:inline">/</span>
            <span className="text-slate-900 dark:text-white font-medium hidden md:inline text-xs lg:text-sm">Generated SRS</span>
          </nav>
          <div className="flex items-center gap-2 lg:gap-6 flex-shrink-0">
            <button
              onClick={() => {
                setIsChatboxOpen(!isChatboxOpen);
                if (!isChatboxOpen) setIsInfoPanelOpen(false);
              }}
              className="p-2 text-slate-500 hover:text-primary transition-colors"
              title="AI Assistant Chat"
            >
              <span className="material-symbols-outlined text-lg">smart_toy</span>
            </button>
            <button
              onClick={() => {
                setIsInfoPanelOpen(!isInfoPanelOpen);
                if (!isInfoPanelOpen) setIsChatboxOpen(false);
              }}
              className="p-2 text-slate-500 hover:text-primary transition-colors"
              title="Document Info"
            >
              <span className="material-symbols-outlined text-lg">info</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-3 lg:p-8 scroll-smooth">
          <div className="max-w-5xl mx-auto flex flex-col gap-3 lg:gap-6">
            {/* Document Header */}
            <DocumentHeader
              projectName={formData?.projectName || ''}
              srsStandard={formData?.srsStandard || ''}
              isEditing={isEditing}
              onEditToggle={() => setIsEditing(!isEditing)}
            />

            {/* Main Content Box */}
            <div className="bg-white dark:bg-[#1a1d2d] rounded-xl border border-[#e7e9f3] dark:border-[#2a2e3b] shadow-sm p-3 lg:p-8 overflow-x-hidden">
              {/* Check if using new API format */}
              {editableContent.title && editableContent.introduction?.purpose ? (
                // New API Format
                <>
                  <IntroductionSectionNew
                    purpose={editableContent.introduction?.purpose || ''}
                    scope={editableContent.introduction?.scope || ''}
                    definitions={editableContent.introduction?.definitions || []}
                    references={editableContent.introduction?.references || []}
                    isEditing={isEditing}
                    onUpdatePurpose={(val) =>
                      setEditableContent({
                        ...editableContent,
                        introduction: {
                          purpose: val,
                          references: editableContent.introduction?.references || [],
                          scope: editableContent.introduction?.scope,
                          definitions: editableContent.introduction?.definitions
                        }
                      })
                    }
                    onUpdateScope={(val) =>
                      setEditableContent({
                        ...editableContent,
                        introduction: {
                          purpose: editableContent.introduction?.purpose || '',
                          references: editableContent.introduction?.references || [],
                          scope: val,
                          definitions: editableContent.introduction?.definitions
                        }
                      })
                    }
                    onUpdateDefinitions={(val) =>
                      setEditableContent({
                        ...editableContent,
                        introduction: {
                          purpose: editableContent.introduction?.purpose || '',
                          references: editableContent.introduction?.references || [],
                          scope: editableContent.introduction?.scope,
                          definitions: val
                        }
                      })
                    }
                    onUpdateReferences={(val) =>
                      setEditableContent({
                        ...editableContent,
                        introduction: {
                          purpose: editableContent.introduction?.purpose || '',
                          references: val,
                          scope: editableContent.introduction?.scope,
                          definitions: editableContent.introduction?.definitions
                        }
                      })
                    }
                  />

                  <OverallDescriptionSectionNew
                    // New API format fields
                    userClassesAndCharacteristics={editableContent.overallDescription?.userClassesAndCharacteristics || []}
                    operatingEnvironment={editableContent.overallDescription?.operatingEnvironment || ''}
                    designAndImplementationConstraints={editableContent.overallDescription?.designAndImplementationConstraints || []}
                    assumptionsAndDependencies={editableContent.overallDescription?.assumptionsAndDependencies || []}
                    // Legacy format fields
                    productPerspective={editableContent.overallDescription?.productPerspective || ''}
                    productFunctions={editableContent.overallDescription?.productFunctions || []}
                    userCharacteristics={editableContent.overallDescription?.userCharacteristics || []}
                    constraints={editableContent.overallDescription?.constraints || []}
                    assumptions={editableContent.overallDescription?.assumptions || []}
                    isEditing={isEditing}
                    // New API format handlers
                    onUpdateUserClassesAndCharacteristics={(val) =>
                      setEditableContent({
                        ...editableContent,
                        overallDescription: {
                          ...editableContent.overallDescription,
                          userClassesAndCharacteristics: val
                        } as any
                      })
                    }
                    onUpdateOperatingEnvironment={(val) =>
                      setEditableContent({
                        ...editableContent,
                        overallDescription: {
                          ...editableContent.overallDescription,
                          operatingEnvironment: val
                        } as any
                      })
                    }
                    onUpdateDesignAndImplementationConstraints={(val) =>
                      setEditableContent({
                        ...editableContent,
                        overallDescription: {
                          ...editableContent.overallDescription,
                          designAndImplementationConstraints: val
                        } as any
                      })
                    }
                    onUpdateAssumptionsAndDependencies={(val) =>
                      setEditableContent({
                        ...editableContent,
                        overallDescription: {
                          ...editableContent.overallDescription,
                          assumptionsAndDependencies: val
                        } as any
                      })
                    }
                    // Legacy format handlers
                    onUpdateProductPerspective={(val) =>
                      setEditableContent({
                        ...editableContent,
                        overallDescription: {
                          ...editableContent.overallDescription,
                          productPerspective: val
                        } as any
                      })
                    }
                    onUpdateProductFunctions={(val) =>
                      setEditableContent({
                        ...editableContent,
                        overallDescription: {
                          ...editableContent.overallDescription,
                          productFunctions: val
                        } as any
                      })
                    }
                    onUpdateUserCharacteristics={(val) =>
                      setEditableContent({
                        ...editableContent,
                        overallDescription: {
                          ...editableContent.overallDescription,
                          userCharacteristics: val
                        } as any
                      })
                    }
                    onUpdateConstraints={(val) =>
                      setEditableContent({
                        ...editableContent,
                        overallDescription: {
                          ...editableContent.overallDescription,
                          constraints: val
                        } as any
                      })
                    }
                    onUpdateAssumptions={(val) =>
                      setEditableContent({
                        ...editableContent,
                        overallDescription: {
                          ...editableContent.overallDescription,
                          assumptions: val
                        } as any
                      })
                    }
                  />

                  {editableContent.externalInterfaceRequirements && (
                    <ExternalInterfaceRequirementsSection
                      userInterfaces={editableContent.externalInterfaceRequirements.userInterfaces || ''}
                      hardwareInterfaces={editableContent.externalInterfaceRequirements.hardwareInterfaces || ''}
                      softwareInterfaces={editableContent.externalInterfaceRequirements.softwareInterfaces || []}
                      communicationInterfaces={editableContent.externalInterfaceRequirements.communicationInterfaces || ''}
                      isEditing={isEditing}
                      onUpdateUserInterfaces={(val) =>
                        setEditableContent({
                          ...editableContent,
                          externalInterfaceRequirements: { ...editableContent.externalInterfaceRequirements, userInterfaces: val }
                        })
                      }
                      onUpdateHardwareInterfaces={(val) =>
                        setEditableContent({
                          ...editableContent,
                          externalInterfaceRequirements: { ...editableContent.externalInterfaceRequirements, hardwareInterfaces: val }
                        })
                      }
                      onUpdateSoftwareInterfaces={(val) =>
                        setEditableContent({
                          ...editableContent,
                          externalInterfaceRequirements: { ...editableContent.externalInterfaceRequirements, softwareInterfaces: val }
                        })
                      }
                      onUpdateCommunicationInterfaces={(val) =>
                        setEditableContent({
                          ...editableContent,
                          externalInterfaceRequirements: { ...editableContent.externalInterfaceRequirements, communicationInterfaces: val }
                        })
                      }
                    />
                  )}

                  <FunctionalRequirementsSection
                    requirements={editableContent.functionalRequirements || []}
                    isEditing={isEditing}
                    onUpdateRequirement={(index: number, requirement: any) => {
                      const updated = [...(editableContent.functionalRequirements || [])];
                      updated[index] = requirement;
                      setEditableContent({
                        ...editableContent,
                        functionalRequirements: updated
                      });
                    }}
                  />

                  <NonFunctionalRequirementsSectionNew
                    requirements={editableContent.nonFunctionalRequirements || []}
                    isEditing={isEditing}
                    onUpdateRequirement={(index: number, requirement: any) => {
                      const updated = [...(editableContent.nonFunctionalRequirements || [])];
                      updated[index] = requirement;
                      setEditableContent({
                        ...editableContent,
                        nonFunctionalRequirements: updated
                      });
                    }}
                  />

                  {editableContent.systemUseCases && editableContent.systemUseCases.length > 0 && (
                    <SystemUseCasesSection
                      useCases={editableContent.systemUseCases}
                      isEditing={isEditing}
                      onUpdateUseCase={(index: number, useCase: any) => {
                        const updated = [...(editableContent.systemUseCases || [])];
                        updated[index] = useCase;
                        setEditableContent({
                          ...editableContent,
                          systemUseCases: updated
                        });
                      }}
                    />
                  )}

                  {editableContent.otherNonfunctionalRequirements && (
                    <OtherNonfunctionalRequirementsSection
                      performanceRequirements={editableContent.otherNonfunctionalRequirements.performanceRequirements || []}
                      safetyRequirements={editableContent.otherNonfunctionalRequirements.safetyRequirements || []}
                      securityRequirements={editableContent.otherNonfunctionalRequirements.securityRequirements || []}
                      softwareQualityAttributes={editableContent.otherNonfunctionalRequirements.softwareQualityAttributes || []}
                      isEditing={isEditing}
                      onUpdatePerformanceRequirements={(val) =>
                        setEditableContent({
                          ...editableContent,
                          otherNonfunctionalRequirements: { ...editableContent.otherNonfunctionalRequirements, performanceRequirements: val }
                        })
                      }
                      onUpdateSafetyRequirements={(val) =>
                        setEditableContent({
                          ...editableContent,
                          otherNonfunctionalRequirements: { ...editableContent.otherNonfunctionalRequirements, safetyRequirements: val }
                        })
                      }
                      onUpdateSecurityRequirements={(val) =>
                        setEditableContent({
                          ...editableContent,
                          otherNonfunctionalRequirements: { ...editableContent.otherNonfunctionalRequirements, securityRequirements: val }
                        })
                      }
                      onUpdateSoftwareQualityAttributes={(val) =>
                        setEditableContent({
                          ...editableContent,
                          otherNonfunctionalRequirements: { ...editableContent.otherNonfunctionalRequirements, softwareQualityAttributes: val }
                        })
                      }
                    />
                  )}
                </>
              ) : (
                // Legacy Format
                <>
                  <IntroductionSection
                    purpose={editableContent.introduction_purpose || ''}
                    scope={editableContent.introduction_scope || ''}
                    product={editableContent.introduction_product || ''}
                    conventions={editableContent.introduction_conventions || ''}
                    references={editableContent.introduction_references || []}
                    isEditing={isEditing}
                    onUpdatePurpose={(val) => setEditableContent({ ...editableContent, introduction_purpose: val })}
                    onUpdateScope={(val) => setEditableContent({ ...editableContent, introduction_scope: val })}
                    onUpdateProduct={(val) => setEditableContent({ ...editableContent, introduction_product: val })}
                    onUpdateConventions={(val) => setEditableContent({ ...editableContent, introduction_conventions: val })}
                    onUpdateReferences={(val) => setEditableContent({ ...editableContent, introduction_references: val })}
                  />

                  <OverallDescriptionSection
                    perspective={editableContent.product_perspective || ''}
                    functions={editableContent.product_functions || []}
                    userCharacteristics={editableContent.user_characteristics || ''}
                    constraints={editableContent.constraints || []}
                    assumptionsDependencies={editableContent.assumptions_dependencies || ''}
                    isEditing={isEditing}
                    onUpdatePerspective={(val) => setEditableContent({ ...editableContent, product_perspective: val })}
                    onUpdateFunctions={(val) => setEditableContent({ ...editableContent, product_functions: val })}
                    onUpdateUserCharacteristics={(val) => setEditableContent({ ...editableContent, user_characteristics: val })}
                    onUpdateConstraints={(val) => setEditableContent({ ...editableContent, constraints: val })}
                    onUpdateAssumptionsDependencies={(val) => setEditableContent({ ...editableContent, assumptions_dependencies: val })}
                  />

                  <ExternalInterfaceRequirementsSection
                    userInterfaces={editableContent.user_interfaces || ''}
                    hardwareInterfaces={editableContent.hardware_interfaces || ''}
                    softwareInterfaces={editableContent.software_interfaces || []}
                    communicationInterfaces={editableContent.communication_interfaces || ''}
                    isEditing={isEditing}
                    onUpdateUserInterfaces={(val) => setEditableContent({ ...editableContent, user_interfaces: val })}
                    onUpdateHardwareInterfaces={(val) => setEditableContent({ ...editableContent, hardware_interfaces: val })}
                    onUpdateSoftwareInterfaces={(val) => setEditableContent({ ...editableContent, software_interfaces: val })}
                    onUpdateCommunicationInterfaces={(val) => setEditableContent({ ...editableContent, communication_interfaces: val })}
                  />

                  <SystemFeaturesSection
                    features={editableContent.system_features || []}
                    isEditing={isEditing}
                    onUpdateFeature={(index: number, feature: any) => {
                      const updated = [...(editableContent.system_features || [])];
                      updated[index] = feature;
                      setEditableContent({ ...editableContent, system_features: updated });
                    }}
                  />

                  <NonFunctionalRequirementsSection
                    performanceRequirements={editableContent.performance_requirements || ''}
                    securityRequirements={editableContent.security_requirements || ''}
                    softwareQualityAttributes={editableContent.software_quality_attributes || ''}
                    businessRules={editableContent.business_rules || []}
                    isEditing={isEditing}
                    onUpdatePerformanceRequirements={(val) => setEditableContent({ ...editableContent, performance_requirements: val })}
                    onUpdateSecurityRequirements={(val) => setEditableContent({ ...editableContent, security_requirements: val })}
                    onUpdateSoftwareQualityAttributes={(val) => setEditableContent({ ...editableContent, software_quality_attributes: val })}
                    onUpdateBusinessRules={(val) => setEditableContent({ ...editableContent, business_rules: val })}
                  />
                </>
              )}

              <AppendicesSection
                srsStandard={formData?.srsStandard || ''}
                uploadedFiles={formData?.uploadedFiles || []}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 lg:gap-4 mt-6 lg:mt-8 pb-4">
              <button
                onClick={handleSaveDraft}
                disabled={saveStatus === 'saving'}
                className={`flex-1 flex items-center justify-center gap-2 px-3 lg:px-6 py-2.5 lg:py-3 rounded-lg border font-medium text-sm order-2 sm:order-1 transition-all ${
                  saveStatus === 'saved'
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300'
                    : saveStatus === 'saving'
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="material-symbols-outlined text-base lg:text-lg">
                  {saveStatus === 'saving' ? 'hourglass_bottom' : saveStatus === 'saved' ? 'check_circle' : 'save'}
                </span>
                <span className="hidden sm:inline">
                  {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save to Draft'}
                </span>
                <span className="sm:hidden">
                  {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save'}
                </span>
              </button>
              <button
                onClick={handleExportDocx}
                disabled={exportStatus === 'exporting'}
                className={`flex-1 flex items-center justify-center gap-2 px-3 lg:px-6 py-2.5 lg:py-3 rounded-lg font-medium text-sm order-1 sm:order-2 transition-all ${
                  exportStatus === 'done'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : exportStatus === 'exporting'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                <span className="material-symbols-outlined text-base lg:text-lg">
                  {exportStatus === 'exporting' ? 'hourglass_bottom' : exportStatus === 'done' ? 'check_circle' : 'description'}
                </span>
                <span className="hidden sm:inline">
                  {exportStatus === 'exporting' ? 'Exporting...' : exportStatus === 'done' ? 'Exported!' : 'Export as DOCX'}
                </span>
                <span className="sm:hidden">
                  {exportStatus === 'exporting' ? 'Exporting...' : exportStatus === 'done' ? 'Exported!' : 'DOCX'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Right Sidebar - Document Info OR Chat */}
      {isInfoPanelOpen && (
        <Sidebar
          isOpen={isInfoPanelOpen}
          onClose={() => setIsInfoPanelOpen(false)}
          projectName={formData?.projectName || ''}
          router={router}
          position="right"
        >
          <RightSidebarContent onClose={() => setIsInfoPanelOpen(false)} />
        </Sidebar>
      )}

      {/* Chat Sidebar */}
      {isChatboxOpen && (
        <ChatSidebar
          isOpen={isChatboxOpen}
          onClose={() => setIsChatboxOpen(false)}
          srsContent={editableContent}
          formData={formData || undefined}
          onSRSUpdate={(updatedContent) => setEditableContent(updatedContent as EditableContent)}
        />
      )}

      {/* Overlay for info panel on mobile */}
      {isInfoPanelOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-10"
          onClick={() => setIsInfoPanelOpen(false)}
        />
      )}
    </div>
  );
}
