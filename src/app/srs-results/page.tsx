"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DocumentHeader from '@/components/srs/DocumentHeader';
import Sidebar from '@/components/srs/Sidebar';
import LeftSidebarContent from '@/components/srs/layout/LeftSidebarContent';
import RightSidebarContent from '@/components/srs/layout/RightSidebarContent';
import IntroductionSection from '@/components/srs/sections/IntroductionSection';
import OverallDescriptionSection from '@/components/srs/sections/OverallDescriptionSection';
import ExternalInterfaceRequirementsSection from '@/components/srs/sections/ExternalInterfaceRequirementsSection';
import SystemFeaturesSection from '@/components/srs/sections/SystemFeaturesSection';
import NonFunctionalRequirementsSection from '@/components/srs/sections/NonFunctionalRequirementsSection';
import AppendicesSection from '@/components/srs/sections/AppendicesSection';

interface FormData {
  projectName: string;
  projectVision: string;
  srsStandard: string;
  toneDetail: string;
  outputLanguage: string;
  autoDetectActors: boolean;
  riskAnalysis: boolean;
  uploadedFiles: string[];
}

interface EditableContent {
  introduction_purpose: string;
  introduction_scope: string;
  introduction_product: string;
  introduction_conventions: string;
  introduction_references: string[];
  product_perspective: string;
  product_functions: string[];
  user_characteristics: string;
  constraints: string[];
  assumptions_dependencies: string;
  user_interfaces: string;
  hardware_interfaces: string;
  software_interfaces: string[];
  communication_interfaces: string;
  system_features: Array<{
    id: string;
    description: string;
    functional_requirements: string[];
  }>;
  performance_requirements: string;
  security_requirements: string;
  software_quality_attributes: string;
  business_rules: string[];
}

export default function SRSResultsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(false);
  const [editableContent, setEditableContent] = useState<EditableContent>({
    // 1. Introduction
    introduction_purpose: '',
    introduction_scope: '',
    introduction_product: '',
    introduction_conventions: 'This document follows the conventions defined in ISO/IEC/IEEE 29148:2018.',
    introduction_references: [
      'ISO/IEC/IEEE 29148:2018 - Systems and software engineering',
      'IEEE 830-1998 - Software Requirements Specifications',
      'Project charter and business requirements'
    ],

    // 2. Overall Description
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

    // 3. External Interface Requirements
    user_interfaces: 'Web-based responsive user interface supporting modern browsers. Mobile-optimized design for on-the-go access.',
    hardware_interfaces: 'Compatible with standard x86/x64 servers and cloud infrastructure (AWS, Azure, GCP).',
    software_interfaces: [
      'REST API for third-party integrations',
      'Database: PostgreSQL/MySQL compatible',
      'Message queue: RabbitMQ/Kafka compatible',
      'Authentication: OAuth 2.0 / SAML 2.0'
    ],
    communication_interfaces: 'HTTPS/TLS 1.2+ for all communications. Supports JSON and XML message formats.',

    // 4. System Features
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
      },
      {
        id: 'F2',
        description: 'Data Management',
        functional_requirements: [
          'System shall support CRUD operations on all data entities',
          'System shall maintain data integrity and consistency',
          'System shall provide data backup and recovery mechanisms',
          'System shall support data import/export functionality'
        ]
      },
      {
        id: 'F3',
        description: 'Reporting & Analytics',
        functional_requirements: [
          'System shall generate customizable reports',
          'System shall provide real-time analytics dashboards',
          'System shall support data visualization',
          'System shall enable report scheduling and distribution'
        ]
      }
    ],

    // 5. Other Non-Functional Requirements
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
          setEditableContent(parsedData.generatedContent);
        } else {
          // Otherwise use the form data to populate the template
          setEditableContent(prev => ({
            ...prev,
            introduction_purpose: `This Software Requirements Specification (SRS) document outlines the functional and non-functional requirements for the ${parsedData.projectName} system. It is developed in accordance with ISO/IEC/IEEE 29148:2018 standards.`,
            introduction_scope: parsedData.projectVision || 'The scope encompasses all functionalities described in the project vision document.',
            introduction_product: `The ${parsedData.projectName} product is a comprehensive software system designed to meet the organization's strategic objectives.`,
            product_perspective: `The ${parsedData.projectName} system is designed as a standalone application that integrates with existing enterprise systems where applicable.`,
            user_characteristics: `Users include system administrators, business analysts, and end-users. The system is designed to be intuitive for novice users while providing advanced features for experienced users.`
          }));
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
              onClick={() => setIsInfoPanelOpen(!isInfoPanelOpen)}
              className="lg:hidden p-2 text-slate-500 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-lg">info</span>
            </button>
            <button className="relative p-2 text-slate-500 hover:text-primary transition-colors hidden sm:block">
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-3 lg:p-8 scroll-smooth">
          <div className="max-w-5xl mx-auto flex flex-col gap-3 lg:gap-6">
            {/* Document Header */}
            <DocumentHeader
              projectName={formData?.projectName || ''}
              srsStandard={formData?.srsStandard || ''}
              toneDetail={formData?.toneDetail || ''}
              outputLanguage={formData?.outputLanguage || ''}
              isEditing={isEditing}
              onEditToggle={() => setIsEditing(!isEditing)}
            />

            {/* Main Content Box */}
            <div className="bg-white dark:bg-[#1a1d2d] rounded-xl border border-[#e7e9f3] dark:border-[#2a2e3b] shadow-sm p-3 lg:p-8 overflow-x-hidden">
              {/* ... Sections ... */}
              <IntroductionSection
                purpose={editableContent.introduction_purpose}
                scope={editableContent.introduction_scope}
                product={editableContent.introduction_product}
                conventions={editableContent.introduction_conventions}
                references={editableContent.introduction_references}
                isEditing={isEditing}
                onUpdatePurpose={(val) => setEditableContent({ ...editableContent, introduction_purpose: val })}
                onUpdateScope={(val) => setEditableContent({ ...editableContent, introduction_scope: val })}
                onUpdateProduct={(val) => setEditableContent({ ...editableContent, introduction_product: val })}
                onUpdateConventions={(val) => setEditableContent({ ...editableContent, introduction_conventions: val })}
                onUpdateReferences={(val) => setEditableContent({ ...editableContent, introduction_references: val })}
              />

              <OverallDescriptionSection
                perspective={editableContent.product_perspective}
                functions={editableContent.product_functions}
                userCharacteristics={editableContent.user_characteristics}
                constraints={editableContent.constraints}
                assumptionsDependencies={editableContent.assumptions_dependencies}
                isEditing={isEditing}
                onUpdatePerspective={(val) => setEditableContent({ ...editableContent, product_perspective: val })}
                onUpdateFunctions={(val) => setEditableContent({ ...editableContent, product_functions: val })}
                onUpdateUserCharacteristics={(val) => setEditableContent({ ...editableContent, user_characteristics: val })}
                onUpdateConstraints={(val) => setEditableContent({ ...editableContent, constraints: val })}
                onUpdateAssumptionsDependencies={(val) => setEditableContent({ ...editableContent, assumptions_dependencies: val })}
              />

              <ExternalInterfaceRequirementsSection
                userInterfaces={editableContent.user_interfaces}
                hardwareInterfaces={editableContent.hardware_interfaces}
                softwareInterfaces={editableContent.software_interfaces}
                communicationInterfaces={editableContent.communication_interfaces}
                isEditing={isEditing}
                onUpdateUserInterfaces={(val) => setEditableContent({ ...editableContent, user_interfaces: val })}
                onUpdateHardwareInterfaces={(val) => setEditableContent({ ...editableContent, hardware_interfaces: val })}
                onUpdateSoftwareInterfaces={(val) => setEditableContent({ ...editableContent, software_interfaces: val })}
                onUpdateCommunicationInterfaces={(val) => setEditableContent({ ...editableContent, communication_interfaces: val })}
              />

              <SystemFeaturesSection
                features={editableContent.system_features}
                isEditing={isEditing}
                onUpdateFeature={(index: number, feature: any) => {
                  const updated = [...editableContent.system_features];
                  updated[index] = feature;
                  setEditableContent({ ...editableContent, system_features: updated });
                }}
              />

              <NonFunctionalRequirementsSection
                performanceRequirements={editableContent.performance_requirements}
                securityRequirements={editableContent.security_requirements}
                softwareQualityAttributes={editableContent.software_quality_attributes}
                businessRules={editableContent.business_rules}
                isEditing={isEditing}
                onUpdatePerformanceRequirements={(val) => setEditableContent({ ...editableContent, performance_requirements: val })}
                onUpdateSecurityRequirements={(val) => setEditableContent({ ...editableContent, security_requirements: val })}
                onUpdateSoftwareQualityAttributes={(val) => setEditableContent({ ...editableContent, software_quality_attributes: val })}
                onUpdateBusinessRules={(val) => setEditableContent({ ...editableContent, business_rules: val })}
              />

              <AppendicesSection
                srsStandard={formData?.srsStandard || ''}
                toneDetail={formData?.toneDetail || ''}
                outputLanguage={formData?.outputLanguage || ''}
                uploadedFiles={formData?.uploadedFiles || []}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 lg:gap-4 mt-6 lg:mt-8 pb-4">
              <button className="flex-1 px-3 lg:px-6 py-2.5 lg:py-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300 font-medium text-sm order-2 sm:order-1">
                Save to Draft
              </button>
              <button className="flex items-center justify-center gap-2 px-3 lg:px-6 py-2.5 lg:py-3 rounded-lg bg-primary hover:bg-blue-700 transition-colors text-white font-medium text-sm order-1 sm:order-2">
                <span className="material-symbols-outlined text-base lg:text-lg">download</span>
                <span className="hidden sm:inline">Export as PDF</span>
                <span className="sm:hidden">Export PDF</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Right Sidebar - Document Info */}
      <Sidebar
        isOpen={isInfoPanelOpen}
        onClose={() => setIsInfoPanelOpen(false)}
        projectName={formData?.projectName || ''}
        router={router}
        position="right"
      >
        <RightSidebarContent onClose={() => setIsInfoPanelOpen(false)} />
      </Sidebar>

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
