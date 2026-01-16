/**
 * IEEE 830-1998 SRS Template Generator
 * Generates a complete Software Requirements Specification document
 */

export interface SRSFormData {
  projectName: string;
  projectVision: string;
  srsStandard: string;
  toneDetail: string;
  outputLanguage: string;
  autoDetectActors?: boolean;
  uploadedFiles?: string[];
}

export interface EditableContent {
  title: string;
  introduction: {
    purpose: string;
    scope: string;
    definitions: string[];
  };
  overallDescription: {
    productPerspective: string;
    productFunctions: string[];
    userCharacteristics: string[];
    constraints: string[];
    assumptions: string[];
  };
  externalInterfaceRequirements: {
    userInterfaces: string;
    hardwareInterfaces: string;
    softwareInterfaces: string[];
    communicationInterfaces: string;
  };
  systemUseCases: Array<{
    name: string;
    identifier: string;
    description: string;
    actors: string[];
    preconditions: string;
    mainFlow: string[];
    alternativeFlow: string[];
  }>;
  functionalRequirements: Array<{
    id: string;
    title: string;
    description: string;
    priority: 'High' | 'Medium' | 'Low';
  }>;
  nonFunctionalRequirements: Array<{
    id: string;
    category: string;
    description: string;
    priority: 'High' | 'Medium' | 'Low';
  }>;
  otherRequirements: string;
}

export function generateSRSFromTemplate(formData: SRSFormData): EditableContent {
  const {
    projectName,
    projectVision,
    srsStandard,
    toneDetail,
    outputLanguage,
    autoDetectActors = true
  } = formData;

  // Parse tone and detail level
  const isTechnical = toneDetail === 'Technical & Formal';
  const isConcise = toneDetail === 'Concise / High-Level';

  // Generate actors from project vision (simple NLP)
  const actors = autoDetectActors ? extractActorsFromVision(projectVision) : [];

  return {
    title: `Software Requirements Specification - ${projectName}`,

    // 1. INTRODUCTION
    introduction: {
      purpose: generatePurpose(projectName, projectVision, isTechnical),
      scope: generateScope(projectName, projectVision, isTechnical),
      definitions: generateDefinitions(projectName, actors)
    },

    // 2. OVERALL DESCRIPTION
    overallDescription: {
      productPerspective: generateProductPerspective(projectName, projectVision),
      productFunctions: generateProductFunctions(projectVision, isConcise),
      userCharacteristics: generateUserCharacteristics(actors, projectVision),
      constraints: generateConstraints(projectName, srsStandard),
      assumptions: generateAssumptions(projectName)
    },

    // 3. EXTERNAL INTERFACE REQUIREMENTS
    externalInterfaceRequirements: {
      userInterfaces: generateUserInterfaces(isTechnical),
      hardwareInterfaces: generateHardwareInterfaces(),
      softwareInterfaces: generateSoftwareInterfaces(projectVision),
      communicationInterfaces: generateCommunicationInterfaces()
    },

    // 4. SYSTEM USE CASES
    systemUseCases: generateSystemUseCases(projectName, actors, projectVision),

    // 5. FUNCTIONAL REQUIREMENTS
    functionalRequirements: generateFunctionalRequirements(projectName, projectVision, isTechnical),

    // 5. NON-FUNCTIONAL REQUIREMENTS
    nonFunctionalRequirements: generateNonFunctionalRequirements(projectName, isTechnical),

    // 6. OTHER REQUIREMENTS
    otherRequirements: generateOtherRequirements(srsStandard, outputLanguage)
  };
}

// Helper functions for each section

function extractActorsFromVision(vision: string): string[] {
  const actors: Set<string> = new Set();

  const actorPatterns = [
    /\badmin\b|\badministrator\b/gi,
    /\buser\b|\bend.?user\b/gi,
    /\bmanager\b/gi,
    /\bstaff\b|\bemployee\b/gi,
    /\bcustomer\b|\bclient\b/gi,
    /\bguest\b/gi,
    /\bsupervisor\b/gi,
    /\b(api|system|service)\b/gi,
  ];

  actorPatterns.forEach(pattern => {
    const matches = vision.match(pattern);
    if (matches) {
      matches.forEach(match => actors.add(capitalizeWords(match)));
    }
  });

  // If no actors detected, use default
  if (actors.size === 0) {
    actors.add('Administrator');
    actors.add('End User');
    actors.add('System');
  }

  return Array.from(actors).slice(0, 5); // Limit to 5 actors
}

function generatePurpose(projectName: string, vision: string, isTechnical: boolean): string {
  const base = `This Software Requirements Specification (SRS) document provides a detailed specification of the requirements for ${projectName}.`;

  if (isTechnical) {
    return `${base} The specification defines functional and non-functional requirements, use cases, and system interfaces in accordance with IEEE 830-1998 standards. Based on the project vision: "${vision.substring(0, 150)}..."`;
  } else {
    return `${base} It outlines what the system will do, who will use it, and how it will perform. This document serves as the contract between stakeholders and the development team.`;
  }
}

function generateScope(projectName: string, vision: string, isTechnical: boolean): string {
  const base = `The ${projectName} system encompasses the following scope:`;

  const scopeItems = [
    'Core functionality as described in project vision',
    'User interface and interaction design',
    'Data management and persistence',
    'System integration and interfaces',
    'Security and access control mechanisms'
  ];

  if (isTechnical) {
    return `${base}\n\n${scopeItems.map((item, i) => `${i + 1}. ${item}`).join('\n')}\n\nThe system explicitly excludes: Third-party applications not defined in software interfaces section.`;
  } else {
    return `${base}\n• User-facing features and workflows\n• Data storage and retrieval\n• System performance and reliability\n• Security and user access management`;
  }
}

function generateDefinitions(projectName: string, actors: string[]): string[] {
  const baseDefinitions = [
    'API: Application Programming Interface',
    'SRS: Software Requirements Specification',
    'CRUD: Create, Read, Update, Delete operations',
    'GUI: Graphical User Interface',
    'HTTP/HTTPS: Hypertext Transfer Protocol (Secure)',
    'Database: Organized collection of data',
    'Authentication: Verification of user identity',
    'Authorization: Permission to access resources'
  ];

  // Add actor definitions
  actors.forEach(actor => {
    baseDefinitions.push(`${actor}: User role with specific system responsibilities and permissions`);
  });

  return baseDefinitions;
}

function generateProductPerspective(projectName: string, vision: string): string {
  return `The ${projectName} system is a standalone software application designed to address the following business needs: "${vision.substring(0, 200)}..."\n\nThe system will operate independently but may integrate with external systems for data exchange and business process automation.`;
}

function generateProductFunctions(vision: string, isConcise: boolean): string[] {
  const functions = [
    'User authentication and role-based access control',
    'Core data management (CRUD operations)',
    'User interface for system interaction',
    'System administration and configuration',
    'Data storage and retrieval',
    'Error handling and logging'
  ];

  // Try to extract specific functions from vision
  if (vision.includes('report') || vision.includes('analytics')) {
    functions.push('Reporting and analytics generation');
  }
  if (vision.includes('integration') || vision.includes('api')) {
    functions.push('Integration with external systems via APIs');
  }
  if (vision.includes('export') || vision.includes('import')) {
    functions.push('Data import/export functionality');
  }
  if (vision.includes('search') || vision.includes('filter')) {
    functions.push('Advanced search and filtering capabilities');
  }

  return isConcise ? functions.slice(0, 4) : functions;
}

function generateUserCharacteristics(actors: string[], _vision: string): string[] {
  return actors.map(actor => {
    const baseDescription = `${actor}: Users in this role have specific responsibilities within the system.`;

    if (actor.toLowerCase().includes('admin')) {
      return `${actor}: System administrators with full access to configuration, user management, and system settings. Advanced technical skills required.`;
    } else if (actor.toLowerCase().includes('manager')) {
      return `${actor}: Managers and supervisors who oversee operations and access reporting/analytics features. Intermediate technical skills.`;
    } else if (actor.toLowerCase().includes('staff') || actor.toLowerCase().includes('employee')) {
      return `${actor}: Staff members performing day-to-day operations. Basic to intermediate technical skills required.`;
    } else if (actor.toLowerCase().includes('customer') || actor.toLowerCase().includes('client')) {
      return `${actor}: External users accessing the system. Variable technical expertise.`;
    } else {
      return baseDescription;
    }
  });
}

function generateConstraints(projectName: string, srsStandard: string): string[] {
  return [
    `Must comply with ${srsStandard} standards`,
    'System must operate within standard IT infrastructure constraints',
    'Data must be encrypted in transit and at rest',
    'System must support concurrent users without performance degradation',
    'All user interactions must be logged for audit purposes',
    'System must be compatible with modern web browsers',
    'Response times must meet performance requirements (TBD)',
    'System must comply with relevant data protection regulations'
  ];
}

function generateAssumptions(_projectName: string): string[] {
  return [
    'Users have access to modern web browsers with JavaScript enabled',
    'Network connectivity is reliable and stable',
    'Database services are continuously available',
    'Users have appropriate training on system usage',
    'Third-party APIs remain available and stable',
    'Hardware infrastructure meets minimum specifications',
    'Users follow security best practices (password management)',
    'System administrators can maintain and support the application'
  ];
}

function generateUserInterfaces(isTechnical: boolean): string {
  if (isTechnical) {
    return `User interfaces are designed using modern web technologies (HTML5, CSS3, JavaScript) with responsive design principles. The UI must support:\n- Desktop browsers (Chrome, Firefox, Safari, Edge)\n- Tablet devices with touch interface\n- Accessibility standards (WCAG 2.1 Level AA)\n- Dark mode and light mode themes\n- Mobile-optimized layouts`;
  } else {
    return `The system provides an intuitive web-based user interface that is easy to navigate. Users access the system through a standard web browser. The interface is designed to be user-friendly with clear navigation, helpful prompts, and consistent design patterns.`;
  }
}

function generateHardwareInterfaces(): string {
  return `The system operates on standard computing hardware including:\n- Servers: x86-64 architecture with sufficient memory and storage\n- Client devices: Desktop computers, laptops, tablets, and smartphones\n- Network infrastructure: Standard TCP/IP networks with internet connectivity\n- Optional: Mobile devices for native app deployment`;
}

function generateSoftwareInterfaces(vision: string): string[] {
  const interfaces = [
    'Web browsers (Chrome, Firefox, Safari, Edge)',
    'Database management system (PostgreSQL/MySQL compatible)',
    'Operating systems (Windows, Linux, macOS)',
    'HTTP/HTTPS protocols for communication'
  ];

  if (vision.includes('api')) {
    interfaces.push('RESTful API for third-party integrations');
  }
  if (vision.includes('shopify') || vision.includes('integration')) {
    interfaces.push('Third-party service APIs (payment, shipping, etc.)');
  }
  if (vision.includes('email')) {
    interfaces.push('Email service for notifications');
  }

  return interfaces;
}

function generateCommunicationInterfaces(): string {
  return `The system uses the following communication protocols:\n- HTTP/HTTPS for all web-based communication (minimum TLS 1.2)\n- JSON for API request/response formatting\n- WebSockets for real-time updates (if applicable)\n- Email protocols (SMTP) for system notifications`;
}

function generateSystemUseCases(projectName: string, actors: string[], vision: string): Array<{
  name: string;
  identifier: string;
  description: string;
  actors: string[];
  preconditions: string;
  mainFlow: string[];
  alternativeFlow: string[];
}> {
  const useCases = [];

  // UC-001: User Login
  useCases.push({
    name: 'User Authentication',
    identifier: 'UC-001',
    description: 'User authenticates with the system using credentials',
    actors: actors.slice(0, 2),
    preconditions: 'User has a valid account with the system',
    mainFlow: [
      'User navigates to the login page',
      'User enters username/email and password',
      'System validates credentials against database',
      'System authenticates user and creates session',
      'User is redirected to dashboard'
    ],
    alternativeFlow: [
      'Invalid credentials: System displays error message',
      'Account locked: System prevents login after multiple failed attempts',
      'Password reset: User initiates password reset flow'
    ]
  });

  // UC-002: Core Operations
  useCases.push({
    name: 'Core Data Operations',
    identifier: 'UC-002',
    description: 'User performs CRUD operations on system data',
    actors: actors.slice(0, 2),
    preconditions: 'User is authenticated and has appropriate permissions',
    mainFlow: [
      'User accesses data management interface',
      'User selects action (Create/Read/Update/Delete)',
      'User provides or confirms data',
      'System validates data',
      'System persists changes to database',
      'System confirms successful operation'
    ],
    alternativeFlow: [
      'Validation error: System displays error and requests correction',
      'Permission denied: System prevents operation if user lacks permissions',
      'Concurrent edit: System handles conflicts (last-write-wins or notification)'
    ]
  });

  // UC-003: Reporting (if mentioned)
  if (vision.includes('report') || vision.includes('analytics')) {
    useCases.push({
      name: 'Generate Reports',
      identifier: 'UC-003',
      description: 'User generates system reports and analytics',
      actors: [actors[0] || 'User'],
      preconditions: 'User has report generation permissions',
      mainFlow: [
        'User navigates to reports section',
        'User selects report type and filters',
        'System queries data based on criteria',
        'System generates report',
        'System displays or exports report'
      ],
      alternativeFlow: [
        'No data: System displays message indicating no data matches criteria',
        'Large dataset: System may require confirmation before generating'
      ]
    });
  }

  // UC-004: System Administration
  useCases.push({
    name: 'System Administration',
    identifier: 'UC-004',
    description: 'Administrator manages system configuration and users',
    actors: [actors.find(a => a.toLowerCase().includes('admin')) || actors[0]],
    preconditions: 'User has administrator role',
    mainFlow: [
      'Administrator accesses admin panel',
      'Administrator selects configuration option',
      'Administrator modifies settings',
      'System validates changes',
      'System applies changes and logs action',
      'Administrator receives confirmation'
    ],
    alternativeFlow: [
      'Invalid configuration: System prevents invalid settings',
      'Critical change: System may require confirmation or approval'
    ]
  });

  return useCases;
}

function generateFunctionalRequirements(_projectName: string, vision: string, _isTechnical: boolean): Array<{
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
}> {
  const requirements = [
    {
      id: 'FR-001',
      title: 'User Authentication',
      description: 'The system shall authenticate users using username/email and password with secure hashing algorithms (bcrypt or equivalent).',
      priority: 'High' as const
    },
    {
      id: 'FR-002',
      title: 'Role-Based Access Control',
      description: 'The system shall enforce role-based access control (RBAC) limiting user actions based on assigned roles and permissions.',
      priority: 'High' as const
    },
    {
      id: 'FR-003',
      title: 'Create/Read/Update/Delete Operations',
      description: 'The system shall support CRUD operations on all primary data entities with appropriate validation and error handling.',
      priority: 'High' as const
    },
    {
      id: 'FR-004',
      title: 'Data Persistence',
      description: 'The system shall reliably store and retrieve all data from persistent storage with data integrity constraints enforced.',
      priority: 'High' as const
    },
    {
      id: 'FR-005',
      title: 'Search and Filtering',
      description: 'The system shall provide search and filtering capabilities allowing users to locate specific records efficiently.',
      priority: 'Medium' as const
    },
    {
      id: 'FR-006',
      title: 'Data Validation',
      description: 'The system shall validate all user inputs and data operations ensuring data quality and preventing invalid states.',
      priority: 'High' as const
    },
    {
      id: 'FR-007',
      title: 'Error Handling',
      description: 'The system shall provide meaningful error messages and gracefully handle exceptions without crashing.',
      priority: 'High' as const
    },
    {
      id: 'FR-008',
      title: 'Audit Logging',
      description: 'The system shall maintain audit logs of all critical operations for security and compliance purposes.',
      priority: 'High' as const
    }
  ];

  // Add vision-specific requirements
  if (vision.includes('report') || vision.includes('analytics')) {
    requirements.push({
      id: 'FR-009',
      title: 'Report Generation',
      description: 'The system shall generate reports and analytics based on stored data with customizable filters and export options.',
      priority: 'Medium'
    });
  }

  if (vision.includes('api') || vision.includes('integration')) {
    requirements.push({
      id: 'FR-010',
      title: 'API Integration',
      description: 'The system shall provide RESTful APIs for third-party integrations with proper authentication and rate limiting.',
      priority: 'Medium'
    });
  }

  if (vision.includes('real-time') || vision.includes('notification')) {
    requirements.push({
      id: 'FR-011',
      title: 'Real-time Notifications',
      description: 'The system shall push real-time notifications to users for critical events.',
      priority: 'Medium'
    });
  }

  if (vision.includes('export') || vision.includes('import')) {
    requirements.push({
      id: 'FR-012',
      title: 'Data Import/Export',
      description: 'The system shall support importing and exporting data in standard formats (CSV, JSON, XML).',
      priority: 'Medium'
    });
  }

  return requirements;
}

function generateNonFunctionalRequirements(_projectName: string, _isTechnical: boolean): Array<{
  id: string;
  category: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
}> {
  return [
    // Performance
    {
      id: 'NFR-001',
      category: 'Performance',
      description: 'Page load time shall not exceed 3 seconds under normal operating conditions with up to 100 concurrent users.',
      priority: 'High'
    },
    {
      id: 'NFR-002',
      category: 'Performance',
      description: 'Database queries shall complete within 500ms for standard operations.',
      priority: 'High'
    },
    {
      id: 'NFR-003',
      category: 'Performance',
      description: 'API response time shall not exceed 1 second for standard endpoints.',
      priority: 'Medium'
    },

    // Security
    {
      id: 'NFR-004',
      category: 'Security',
      description: 'All passwords shall be encrypted using industry-standard algorithms (bcrypt, PBKDF2, or Argon2).',
      priority: 'High'
    },
    {
      id: 'NFR-005',
      category: 'Security',
      description: 'All communication shall use HTTPS with TLS 1.2 or higher encryption.',
      priority: 'High'
    },
    {
      id: 'NFR-006',
      category: 'Security',
      description: 'The system shall implement rate limiting to prevent brute force attacks.',
      priority: 'High'
    },
    {
      id: 'NFR-007',
      category: 'Security',
      description: 'All security-relevant events shall be logged and monitored for suspicious activity.',
      priority: 'High'
    },

    // Reliability
    {
      id: 'NFR-008',
      category: 'Reliability',
      description: 'System shall achieve 99.5% uptime availability (excluding scheduled maintenance).',
      priority: 'High'
    },
    {
      id: 'NFR-009',
      category: 'Reliability',
      description: 'System shall implement automated backup mechanisms with recovery capability.',
      priority: 'High'
    },
    {
      id: 'NFR-010',
      category: 'Reliability',
      description: 'Mean time to recovery (MTTR) from critical failures shall not exceed 1 hour.',
      priority: 'Medium'
    },

    // Usability
    {
      id: 'NFR-011',
      category: 'Usability',
      description: 'User interface shall comply with WCAG 2.1 Level AA accessibility standards.',
      priority: 'Medium'
    },
    {
      id: 'NFR-012',
      category: 'Usability',
      description: 'System shall provide responsive design supporting mobile, tablet, and desktop devices.',
      priority: 'High'
    },

    // Maintainability
    {
      id: 'NFR-013',
      category: 'Maintainability',
      description: 'Code shall maintain minimum 80% test coverage for critical functionality.',
      priority: 'Medium'
    },
    {
      id: 'NFR-014',
      category: 'Maintainability',
      description: 'All APIs shall be documented with OpenAPI/Swagger specifications.',
      priority: 'Medium'
    }
  ];
}

function generateOtherRequirements(srsStandard: string, outputLanguage: string): string {
  return `
COMPLIANCE AND LEGAL REQUIREMENTS:
- System must comply with ${srsStandard} standard for software requirements
- All data must comply with GDPR, CCPA, and relevant data protection regulations
- System must implement data retention policies as per regulatory requirements
- System must maintain audit trails for compliance verification

LOCALIZATION:
- System interface shall support ${outputLanguage} language
- Date and time formats shall respect locale settings
- Currency and number formatting shall be locale-appropriate

SCALABILITY AND FUTURE CONSIDERATIONS:
- System architecture shall support horizontal scaling for increased load
- Database schema shall allow for additional entities and relationships
- API design shall maintain backward compatibility in future versions
- System shall be designed for easy deployment to cloud infrastructure

DOCUMENTATION REQUIREMENTS:
- User documentation shall be provided for all major features
- Administrator guide shall document configuration and maintenance
- Technical documentation shall include architecture and design decisions
- All source code shall include inline comments for complex logic

TRAINING AND SUPPORT:
- Development team shall provide initial user training
- Documentation shall be accessible to all user roles
- Support procedures shall be documented and communicated
  `.trim();
}

function capitalizeWords(str: string): string {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

