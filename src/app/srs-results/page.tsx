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
import type { ValidationIssue, ValidationResult } from '@/lib/srsValidator';

interface FormData {
  projectName: string;
  projectVision: string;
  srsStandard: string;
  uploadedFiles: string[];
  validationResult?: ValidationResult;
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
    rationale?: string;
    source?: string[];
    fitCriterion?: string;
    verificationMethod?: string;
  }>;
  nonFunctionalRequirements?: Array<{
    id: string;
    category: string;
    description: string;
    priority: string;
    source?: string[];
    fitCriterion?: string;
    verificationMethod?: string;
  }>;
  dataRequirements?: {
    logicalDataModel?: string;
    dataEntities?: string[];
    dataRetention?: string[];
    dataValidationRules?: string[];
  };
  verificationAndAcceptance?: {
    acceptanceCriteria?: string[];
    verificationMapping?: string[];
  };
  traceability?: {
    stakeholderToRequirements?: string[];
    useCaseToRequirements?: string[];
    requirementDependencies?: string[];
  };
  qualityCheckSummary?: {
    completenessNotes?: string[];
    ambiguityRisks?: string[];
    consistencyRisks?: string[];
    missingTraceLinks?: string[];
    assumptionsMade?: string[];
  };
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

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function toText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map(v => toText(v)).filter(Boolean).join('\n');
  if (value && typeof value === 'object') {
    const rec = value as Record<string, unknown>;
    const named = [rec.id, rec.name, rec.description]
      .map(v => (typeof v === 'string' ? v.trim() : ''))
      .filter(Boolean);
    if (named.length) return named.join(' - ');
    return Object.values(rec).map(v => toText(v)).filter(Boolean).join('\n');
  }
  return '';
}

function toList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(v => toText(v)).filter(Boolean);
  const one = toText(value);
  return one ? [one] : [];
}

function flattenNfrGroups(value: unknown): Array<Record<string, unknown>> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [];

  const grouped = value as Record<string, unknown>;
  const output: Array<Record<string, unknown>> = [];

  Object.entries(grouped).forEach(([groupName, groupValue]) => {
    if (!Array.isArray(groupValue)) return;

    groupValue.forEach((entry) => {
      const item = asRecord(entry);
      output.push({
        ...item,
        category: toText(item.category) || groupName
      });
    });
  });

  return output;
}

function normalizeValidationResult(value: unknown): ValidationResult | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

  const data = value as Record<string, unknown>;
  const issues = Array.isArray(data.issues)
    ? data.issues.filter((issue): issue is ValidationIssue => {
        if (!issue || typeof issue !== 'object' || Array.isArray(issue)) return false;
        const record = issue as Record<string, unknown>;
        return record.severity === 'error' || record.severity === 'warning';
      })
    : [];

  const errorCount = typeof data.errorCount === 'number'
    ? data.errorCount
    : issues.filter(issue => issue.severity === 'error').length;
  const warningCount = typeof data.warningCount === 'number'
    ? data.warningCount
    : issues.filter(issue => issue.severity === 'warning').length;

  if (issues.length > 0) {
    console.log('[SRS Validation] Issues:', issues);
  }

  return {
    passed: typeof data.passed === 'boolean' ? data.passed : errorCount === 0,
    errorCount,
    warningCount,
    qualityScore: typeof data.qualityScore === 'number' ? data.qualityScore : 0,
    issues
  };
}

function normalizeGeneratedContent(content: unknown, prev: EditableContent): EditableContent {
  const data = asRecord(content);
  const intro = asRecord(data.introduction ?? data['1Introduction']);
  const context = asRecord(data['2ContextOfTheSystem']);
  const overall = asRecord(data.overallDescription ?? context);
  const featureAndUseCase = asRecord(data['3SystemFeaturesAndUseCases']);
  const external = asRecord(data.externalInterfaceRequirements ?? data['6ExternalInterfaceRequirements']);
  const dataRequirements = asRecord(data['7DataRequirements']);
  const verificationAndAcceptance = asRecord(data['9VerificationAndAcceptance']);
  const traceability = asRecord(data['10Traceability']);
  const qualityCheckSummary = asRecord(data.qualityCheckSummary ?? data['12QualityCheckSummary']);
  const docControl = asRecord(data.documentControl);

  const useCaseSource = Array.isArray(data.systemUseCases)
    ? data.systemUseCases
    : Array.isArray(featureAndUseCase['3.2UseCases'])
      ? (featureAndUseCase['3.2UseCases'] as unknown[])
      : [];

  const frSource = Array.isArray(data.functionalRequirements)
    ? data.functionalRequirements
    : Array.isArray(data['4FunctionalRequirements'])
      ? (data['4FunctionalRequirements'] as unknown[])
      : [];

  const nfrSource = Array.isArray(data.nonFunctionalRequirements)
    ? data.nonFunctionalRequirements
    : flattenNfrGroups(data['5NonFunctionalRequirements']);

  const majorFeatures = Array.isArray(featureAndUseCase['3.1MajorSystemFeatures'])
    ? (featureAndUseCase['3.1MajorSystemFeatures'] as unknown[])
    : [];

  const systemUseCases = useCaseSource
    .map((item, idx) => {
        const uc = asRecord(item);
        return {
          name: toText(uc.name) || `Use Case ${idx + 1}`,
          identifier: toText(uc.identifier) || toText(uc.id) || `UC-${String(idx + 1).padStart(3, '0')}`,
          description: toText(uc.description) || toText(uc.goal),
          actors: toList(uc.actors ?? uc.primaryActors),
          preconditions: Array.isArray(uc.preconditions) ? toList(uc.preconditions).join('\n') : toText(uc.preconditions),
          mainFlow: toList(uc.mainFlow),
          alternativeFlow: toList(uc.alternativeFlow ?? uc.alternativeFlows)
        };
      })
    ;

  const functionalRequirements = frSource
    .map((item, idx) => {
        const fr = asRecord(item);
        const statement = toText(fr.statement);
        return {
          id: toText(fr.id) || `FR-${String(idx + 1).padStart(3, '0')}`,
          title: toText(fr.title) || statement || `Functional Requirement ${idx + 1}`,
          description: toText(fr.description) || statement,
          priority: toText(fr.priority) || 'Medium',
          rationale: toText(fr.rationale),
          source: toList(fr.source),
          fitCriterion: toText(fr.fitCriterion),
          verificationMethod: toText(fr.verificationMethod)
        };
      })
    ;

  const nonFunctionalRequirements = nfrSource
    .map((item, idx) => {
        const nfr = asRecord(item);
        const statement = toText(nfr.statement);
        return {
          id: toText(nfr.id) || `NFR-${String(idx + 1).padStart(3, '0')}`,
          category: toText(nfr.category) || 'Reliability',
          description: toText(nfr.description) || statement,
          priority: toText(nfr.priority) || 'Medium',
          source: toList(nfr.source),
          fitCriterion: toText(nfr.fitCriterion),
          verificationMethod: toText(nfr.verificationMethod)
        };
      })
    ;

  const mappedSystemFeatures = majorFeatures.map((item, idx) => {
    const feature = asRecord(item);
    return {
      id: toText(feature.id) || `F${idx + 1}`,
      description: toText(feature.name) || toText(feature.description) || `System Feature ${idx + 1}`,
      functional_requirements: [] as string[]
    };
  });

  return {
    ...prev,
    ...data,
    title: toText(data.title) || toText(docControl.documentTitle) || toText(docControl.title) || prev.title,
    introduction: {
      purpose: toText(intro.purpose ?? intro['1.1Purpose']) || toText(data.introduction_purpose) || prev.introduction?.purpose || '',
      scope: toText(intro.scope ?? intro['1.2Scope']) || toText(data.introduction_scope) || prev.introduction?.scope || '',
      definitions: toList(intro.definitions ?? intro.definitionsAcronymsAndAbbreviations ?? intro['1.5DefinitionsAcronymsAbbreviations'] ?? prev.introduction?.definitions ?? []),
      references: toList(intro.references ?? intro['1.6References'] ?? data.introduction_references ?? prev.introduction?.references ?? [])
    },
    overallDescription: {
      ...prev.overallDescription,
      ...overall,
      // Keep object entries for richer display; section component normalizes safely.
      userClassesAndCharacteristics: (Array.isArray(overall.userClassesAndCharacteristics)
        ? (overall.userClassesAndCharacteristics as any[])
        : toList(overall.userCharacteristics ?? context['2.4UserClasses'])) as any,
      operatingEnvironment: toText(overall.operatingEnvironment ?? context['2.5OperatingEnvironment']),
      designAndImplementationConstraints: toList(
        overall.designAndImplementationConstraints
        ?? overall.constraints
        ?? context['2.7Constraints']
        ?? data['8DesignAndImplementationConstraints']
      ),
      assumptionsAndDependencies: toList(overall.assumptionsAndDependencies ?? overall.assumptions ?? context['2.6AssumptionsDependencies']),
      productPerspective: toText(overall.productPerspective) || toText(data.product_perspective) || prev.overallDescription?.productPerspective || '',
      productFunctions: toList(overall.productFunctions ?? data.product_functions ?? prev.overallDescription?.productFunctions ?? []),
      userCharacteristics: toList(overall.userCharacteristics ?? prev.overallDescription?.userCharacteristics ?? []),
      constraints: toList(overall.constraints ?? data.constraints ?? prev.overallDescription?.constraints ?? []),
      assumptions: toList(overall.assumptions ?? prev.overallDescription?.assumptions ?? [])
    },
    externalInterfaceRequirements: {
      userInterfaces: toText(external.userInterfaces ?? external['6.1UserInterfaces'] ?? data.user_interfaces ?? ''),
      hardwareInterfaces: toText(external.hardwareInterfaces ?? external['6.2HardwareInterfaces'] ?? data.hardware_interfaces ?? ''),
      softwareInterfaces: toList(external.softwareInterfaces ?? external['6.3SoftwareInterfaces'] ?? data.software_interfaces ?? []),
      communicationInterfaces: toText(external.communicationInterfaces ?? external['6.4CommunicationInterfaces'] ?? data.communication_interfaces ?? '')
    },
    systemUseCases,
    functionalRequirements,
    nonFunctionalRequirements,
    dataRequirements: {
      logicalDataModel: toText(dataRequirements['7.1LogicalDataModel']),
      dataEntities: toList(dataRequirements['7.2DataEntities']),
      dataRetention: toList(dataRequirements['7.3DataRetention']),
      dataValidationRules: toList(dataRequirements['7.4DataValidationRules'])
    },
    verificationAndAcceptance: {
      acceptanceCriteria: toList(verificationAndAcceptance['9.1AcceptanceCriteria']),
      verificationMapping: toList(verificationAndAcceptance['9.2VerificationMapping'])
    },
    traceability: {
      stakeholderToRequirements: toList(traceability.stakeholderToRequirements),
      useCaseToRequirements: toList(traceability.useCaseToRequirements),
      requirementDependencies: toList(traceability.requirementDependencies)
    },
    qualityCheckSummary: {
      completenessNotes: toList(qualityCheckSummary.completenessNotes),
      ambiguityRisks: toList(qualityCheckSummary.ambiguityRisks),
      consistencyRisks: toList(qualityCheckSummary.consistencyRisks),
      missingTraceLinks: toList(qualityCheckSummary.missingTraceLinks),
      assumptionsMade: toList(qualityCheckSummary.assumptionsMade)
    },
    system_features: mappedSystemFeatures.length > 0 ? mappedSystemFeatures : prev.system_features,
    otherRequirements: typeof data.otherRequirements === 'string' ? data.otherRequirements : toText(data.otherRequirements),
    systemRequirementsChart: typeof data.systemRequirementsChart === 'string' ? data.systemRequirementsChart : toText(data.systemRequirementsChart),
    // Legacy mirrors
    introduction_purpose: toText(intro.purpose ?? intro['1.1Purpose'] ?? data.introduction_purpose ?? prev.introduction_purpose ?? ''),
    introduction_scope: toText(intro.scope ?? intro['1.2Scope'] ?? data.introduction_scope ?? prev.introduction_scope ?? ''),
    introduction_references: toList(intro.references ?? intro['1.6References'] ?? intro.definitions ?? data.introduction_references ?? prev.introduction_references ?? []),
    product_perspective: toText(overall.productPerspective ?? data.product_perspective ?? prev.product_perspective ?? ''),
    product_functions: toList(overall.productFunctions ?? data.product_functions ?? prev.product_functions ?? []),
    user_characteristics: toList(overall.userCharacteristics ?? data.user_characteristics ?? []).join(', ') || prev.user_characteristics || '',
    constraints: toList(overall.constraints ?? data.constraints ?? prev.constraints ?? []),
    assumptions_dependencies: toList(overall.assumptions ?? data.assumptions_dependencies ?? prev.assumptions_dependencies ?? []).join(', '),
    user_interfaces: toText(external.userInterfaces ?? data.user_interfaces ?? prev.user_interfaces ?? ''),
    hardware_interfaces: toText(external.hardwareInterfaces ?? data.hardware_interfaces ?? prev.hardware_interfaces ?? ''),
    software_interfaces: toList(external.softwareInterfaces ?? data.software_interfaces ?? prev.software_interfaces ?? []),
    communication_interfaces: toText(external.communicationInterfaces ?? data.communication_interfaces ?? prev.communication_interfaces ?? '')
  };
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
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
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

  const updateRootField = <K extends keyof EditableContent>(key: K, value: EditableContent[K]) => {
    setEditableContent(prev => ({ ...prev, [key]: value }));
  };

  const updateNestedField = <K extends keyof EditableContent>(
    key: K,
    patch: Partial<Record<string, unknown>>
  ) => {
    setEditableContent(prev => ({
      ...prev,
      [key]: {
        ...(asRecord(prev[key])),
        ...patch
      }
    }));
  };

  const updateArrayItem = <K extends keyof EditableContent>(key: K, index: number, value: unknown) => {
    setEditableContent(prev => {
      const current = Array.isArray(prev[key]) ? [...(prev[key] as unknown[])] : [];
      current[index] = value;
      return {
        ...prev,
        [key]: current
      };
    });
  };

  const renderSimpleList = (title: string, items: string[], keyPrefix: string) => {
    if (items.length === 0) return null;

    return (
      <div>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{title}</p>
        <ul className="list-disc ml-5 text-sm text-slate-600 dark:text-slate-400 space-y-1">
          {items.map((item, idx) => (
            <li key={`${keyPrefix}-${idx}`}>{item}</li>
          ))}
        </ul>
      </div>
    );
  };

  useEffect(() => {
    try {
      // Load generated data from localStorage
      const generatedData = sessionStorage.getItem('srs-generated');

      if (generatedData) {
        const parsedData = JSON.parse(generatedData);
        setFormData(parsedData);
        setValidationResult(normalizeValidationResult(parsedData.validationResult ?? parsedData.validation));

        // If we have generated content from the API, normalize and use it
        if (parsedData.generatedContent) {
          setEditableContent(prev => normalizeGeneratedContent(parsedData.generatedContent, prev));
        } else {
          // No generated content - use template generator to create SRS from form data
          try {
            const generatedSRS = generateSRSFromTemplate({
              projectName: parsedData.projectName || 'Unnamed Project',
              projectVision: parsedData.projectVision || 'Project vision not provided',
              srsStandard: parsedData.srsStandard || 'IEEE 830-1998',
              uploadedFiles: parsedData.uploadedFiles || []
            });

            const normalized = normalizeGeneratedContent(generatedSRS, editableContent);
            setEditableContent(normalized);

            // Also save the generated content to localStorage
            const updatedData = {
              ...parsedData,
              generatedContent: normalized,
              validationResult,
              lastModified: new Date().toISOString()
            };
            sessionStorage.setItem('srs-generated', JSON.stringify(updatedData));
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
          validationResult,
          lastModified: new Date().toISOString()
        };
        sessionStorage.setItem('srs-generated', JSON.stringify(updatedData));
      } catch (error) {
        console.error('Failed to save SRS data to localStorage:', error);
      }
    }
  }, [editableContent, formData, loading, validationResult]);

  const handleSaveDraft = async () => {
    try {
      setSaveStatus('saving');

      // Simulate a slight delay for UX feedback
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedData = {
        ...formData,
        generatedContent: editableContent,
        validationResult,
        lastModified: new Date().toISOString(),
        savedAt: new Date().toISOString()
      };

      sessionStorage.setItem('srs-generated', JSON.stringify(updatedData));
      sessionStorage.setItem('srs-draft', JSON.stringify(updatedData));

      // Update recent projects with latest save time
      try {
        const stored = sessionStorage.getItem('srs-recent-projects');
        const projects = stored ? JSON.parse(stored) : [];

        const projectIndex = projects.findIndex((p: any) => p.projectName === formData?.projectName);
        if (projectIndex > -1) {
          projects[projectIndex].savedAt = new Date().toISOString();
          sessionStorage.setItem('srs-recent-projects', JSON.stringify(projects));
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

            {validationResult && (
              <div className="bg-white dark:bg-[#1a1d2d] rounded-xl border border-[#e7e9f3] dark:border-[#2a2e3b] shadow-sm p-4 lg:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">SRS Validation Result</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {validationResult.passed ? 'Passed with no blocking errors.' : 'Needs fixes before finalizing.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`px-2 py-1 rounded-full font-medium ${validationResult.passed ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                      {validationResult.passed ? 'Passed' : 'Failed'}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">Score: {validationResult.qualityScore}/100</span>
                    <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">Errors: {validationResult.errorCount}</span>
                    <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">Warnings: {validationResult.warningCount}</span>
                  </div>
                </div>

                {validationResult.issues.length > 0 && (
                // {true && (
                  <div className="mt-4 space-y-2 max-h-64 overflow-auto pr-1">
                    {validationResult.issues.map((issue, index) => (
                      <div key={`${issue.code}-${issue.requirementId || 'na'}-${index}`} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                        <div className="flex items-center gap-2 text-xs">
                          <span className={`px-2 py-0.5 rounded-full font-medium ${issue.severity === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}`}>
                            {issue.severity}
                          </span>
                          <span className="font-mono text-slate-500 dark:text-slate-400">{issue.code}</span>
                          {issue.requirementId && (
                            <span className="text-slate-500 dark:text-slate-400">{issue.requirementId}</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-800 dark:text-slate-200 mt-2">{issue.message}</p>
                        {issue.suggestion && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Suggestion: {issue.suggestion}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

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
                    onUpdatePurpose={(val) => updateNestedField('introduction', { purpose: val })}
                    onUpdateScope={(val) => updateNestedField('introduction', { scope: val })}
                    onUpdateDefinitions={(val) => updateNestedField('introduction', { definitions: val })}
                    onUpdateReferences={(val) => updateNestedField('introduction', { references: val })}
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
                    onUpdateUserClassesAndCharacteristics={(val) => updateNestedField('overallDescription', { userClassesAndCharacteristics: val })}
                    onUpdateOperatingEnvironment={(val) => updateNestedField('overallDescription', { operatingEnvironment: val })}
                    onUpdateDesignAndImplementationConstraints={(val) => updateNestedField('overallDescription', { designAndImplementationConstraints: val })}
                    onUpdateAssumptionsAndDependencies={(val) => updateNestedField('overallDescription', { assumptionsAndDependencies: val })}
                    // Legacy format handlers
                    onUpdateProductPerspective={(val) => updateNestedField('overallDescription', { productPerspective: val })}
                    onUpdateProductFunctions={(val) => updateNestedField('overallDescription', { productFunctions: val })}
                    onUpdateUserCharacteristics={(val) => updateNestedField('overallDescription', { userCharacteristics: val })}
                    onUpdateConstraints={(val) => updateNestedField('overallDescription', { constraints: val })}
                    onUpdateAssumptions={(val) => updateNestedField('overallDescription', { assumptions: val })}
                  />

                  {editableContent.externalInterfaceRequirements && (
                    <ExternalInterfaceRequirementsSection
                      userInterfaces={editableContent.externalInterfaceRequirements.userInterfaces || ''}
                      hardwareInterfaces={editableContent.externalInterfaceRequirements.hardwareInterfaces || ''}
                      softwareInterfaces={editableContent.externalInterfaceRequirements.softwareInterfaces || []}
                      communicationInterfaces={editableContent.externalInterfaceRequirements.communicationInterfaces || ''}
                      isEditing={isEditing}
                      onUpdateUserInterfaces={(val) => updateNestedField('externalInterfaceRequirements', { userInterfaces: val })}
                      onUpdateHardwareInterfaces={(val) => updateNestedField('externalInterfaceRequirements', { hardwareInterfaces: val })}
                      onUpdateSoftwareInterfaces={(val) => updateNestedField('externalInterfaceRequirements', { softwareInterfaces: val })}
                      onUpdateCommunicationInterfaces={(val) => updateNestedField('externalInterfaceRequirements', { communicationInterfaces: val })}
                    />
                  )}

                  <FunctionalRequirementsSection
                    requirements={editableContent.functionalRequirements || []}
                    isEditing={isEditing}
                    onUpdateRequirement={(index: number, requirement: any) => updateArrayItem('functionalRequirements', index, requirement)}
                  />

                  <NonFunctionalRequirementsSectionNew
                    requirements={editableContent.nonFunctionalRequirements || []}
                    isEditing={isEditing}
                    onUpdateRequirement={(index: number, requirement: any) => updateArrayItem('nonFunctionalRequirements', index, requirement)}
                  />

                  {editableContent.systemUseCases && editableContent.systemUseCases.length > 0 && (
                    <SystemUseCasesSection
                      useCases={editableContent.systemUseCases}
                      isEditing={isEditing}
                      onUpdateUseCase={(index: number, useCase: any) => updateArrayItem('systemUseCases', index, useCase)}
                    />
                  )}

                  {((editableContent.dataRequirements?.logicalDataModel || '').trim() ||
                    (editableContent.dataRequirements?.dataEntities?.length || 0) > 0 ||
                    (editableContent.dataRequirements?.dataRetention?.length || 0) > 0 ||
                    (editableContent.dataRequirements?.dataValidationRules?.length || 0) > 0) && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">7. Data Requirements</h3>
                      {editableContent.dataRequirements?.logicalDataModel && (
                        <p className="text-sm text-slate-700 dark:text-slate-300">{editableContent.dataRequirements.logicalDataModel}</p>
                      )}
                      {renderSimpleList('Data Entities', editableContent.dataRequirements?.dataEntities || [], 'de')}
                      {renderSimpleList('Data Retention', editableContent.dataRequirements?.dataRetention || [], 'dr')}
                    </div>
                  )}

                  {((editableContent.verificationAndAcceptance?.acceptanceCriteria?.length || 0) > 0 ||
                    (editableContent.verificationAndAcceptance?.verificationMapping?.length || 0) > 0) && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">9. Verification and Acceptance</h3>
                      {renderSimpleList('Acceptance Criteria', editableContent.verificationAndAcceptance?.acceptanceCriteria || [], 'ac')}
                      {renderSimpleList('Verification Mapping', editableContent.verificationAndAcceptance?.verificationMapping || [], 'vm')}
                    </div>
                  )}

                  {((editableContent.traceability?.stakeholderToRequirements?.length || 0) > 0 ||
                    (editableContent.traceability?.useCaseToRequirements?.length || 0) > 0 ||
                    (editableContent.traceability?.requirementDependencies?.length || 0) > 0) && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">10. Traceability</h3>
                      {renderSimpleList('Stakeholder to Requirements', editableContent.traceability?.stakeholderToRequirements || [], 'tr-s')}
                      {renderSimpleList('Use Case to Requirements', editableContent.traceability?.useCaseToRequirements || [], 'tr-u')}
                    </div>
                  )}

                  {((editableContent.qualityCheckSummary?.completenessNotes?.length || 0) > 0 ||
                    (editableContent.qualityCheckSummary?.ambiguityRisks?.length || 0) > 0 ||
                    (editableContent.qualityCheckSummary?.consistencyRisks?.length || 0) > 0 ||
                    (editableContent.qualityCheckSummary?.assumptionsMade?.length || 0) > 0) && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">12. Quality Check Summary</h3>
                      {renderSimpleList('Completeness Notes', editableContent.qualityCheckSummary?.completenessNotes || [], 'qc-c')}
                      {renderSimpleList('Ambiguity Risks', editableContent.qualityCheckSummary?.ambiguityRisks || [], 'qc-a')}
                      {renderSimpleList('Consistency Risks', editableContent.qualityCheckSummary?.consistencyRisks || [], 'qc-r')}
                    </div>
                  )}


                  {editableContent.otherNonfunctionalRequirements && (
                    <OtherNonfunctionalRequirementsSection
                      performanceRequirements={editableContent.otherNonfunctionalRequirements.performanceRequirements || []}
                      safetyRequirements={editableContent.otherNonfunctionalRequirements.safetyRequirements || []}
                      securityRequirements={editableContent.otherNonfunctionalRequirements.securityRequirements || []}
                      softwareQualityAttributes={editableContent.otherNonfunctionalRequirements.softwareQualityAttributes || []}
                      isEditing={isEditing}
                      onUpdatePerformanceRequirements={(val) => updateNestedField('otherNonfunctionalRequirements', { performanceRequirements: val })}
                      onUpdateSafetyRequirements={(val) => updateNestedField('otherNonfunctionalRequirements', { safetyRequirements: val })}
                      onUpdateSecurityRequirements={(val) => updateNestedField('otherNonfunctionalRequirements', { securityRequirements: val })}
                      onUpdateSoftwareQualityAttributes={(val) => updateNestedField('otherNonfunctionalRequirements', { softwareQualityAttributes: val })}
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
                    onUpdatePurpose={(val) => updateRootField('introduction_purpose', val)}
                    onUpdateScope={(val) => updateRootField('introduction_scope', val)}
                    onUpdateProduct={(val) => updateRootField('introduction_product', val)}
                    onUpdateConventions={(val) => updateRootField('introduction_conventions', val)}
                    onUpdateReferences={(val) => updateRootField('introduction_references', val)}
                  />

                  <OverallDescriptionSection
                    perspective={editableContent.product_perspective || ''}
                    functions={editableContent.product_functions || []}
                    userCharacteristics={editableContent.user_characteristics || ''}
                    constraints={editableContent.constraints || []}
                    assumptionsDependencies={editableContent.assumptions_dependencies || ''}
                    isEditing={isEditing}
                    onUpdatePerspective={(val) => updateRootField('product_perspective', val)}
                    onUpdateFunctions={(val) => updateRootField('product_functions', val)}
                    onUpdateUserCharacteristics={(val) => updateRootField('user_characteristics', val)}
                    onUpdateConstraints={(val) => updateRootField('constraints', val)}
                    onUpdateAssumptionsDependencies={(val) => updateRootField('assumptions_dependencies', val)}
                  />

                  <ExternalInterfaceRequirementsSection
                    userInterfaces={editableContent.user_interfaces || ''}
                    hardwareInterfaces={editableContent.hardware_interfaces || ''}
                    softwareInterfaces={editableContent.software_interfaces || []}
                    communicationInterfaces={editableContent.communication_interfaces || ''}
                    isEditing={isEditing}
                    onUpdateUserInterfaces={(val) => updateRootField('user_interfaces', val)}
                    onUpdateHardwareInterfaces={(val) => updateRootField('hardware_interfaces', val)}
                    onUpdateSoftwareInterfaces={(val) => updateRootField('software_interfaces', val)}
                    onUpdateCommunicationInterfaces={(val) => updateRootField('communication_interfaces', val)}
                  />

                  <SystemFeaturesSection
                    features={editableContent.system_features || []}
                    isEditing={isEditing}
                    onUpdateFeature={(index: number, feature: any) => updateArrayItem('system_features', index, feature)}
                  />

                  <NonFunctionalRequirementsSection
                    performanceRequirements={editableContent.performance_requirements || ''}
                    securityRequirements={editableContent.security_requirements || ''}
                    softwareQualityAttributes={editableContent.software_quality_attributes || ''}
                    businessRules={editableContent.business_rules || []}
                    isEditing={isEditing}
                    onUpdatePerformanceRequirements={(val) => updateRootField('performance_requirements', val)}
                    onUpdateSecurityRequirements={(val) => updateRootField('security_requirements', val)}
                    onUpdateSoftwareQualityAttributes={(val) => updateRootField('software_quality_attributes', val)}
                    onUpdateBusinessRules={(val) => updateRootField('business_rules', val)}
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
          onSRSUpdate={(updatedContent) =>
            setEditableContent(prev => normalizeGeneratedContent(updatedContent, prev))
          }
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
