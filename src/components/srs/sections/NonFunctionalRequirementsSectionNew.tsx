import React from 'react';
import { Section, Subsection } from '../SectionHeading';

interface NonFunctionalRequirement {
  id: string;
  category: string;
  description: string;
  priority: string;
}

interface NonFunctionalRequirementsSectionProps {
  requirements: NonFunctionalRequirement[];
  isEditing: boolean;
  onUpdateRequirement: (index: number, requirement: NonFunctionalRequirement) => void;
  onAddRequirement?: () => void;
  onRemoveRequirement?: (index: number) => void;
}

export const NonFunctionalRequirementsSectionNew: React.FC<NonFunctionalRequirementsSectionProps> = ({
  requirements = [],
  isEditing,
  onUpdateRequirement,
  onAddRequirement,
  onRemoveRequirement
}) => {
  const safeRequirements = Array.isArray(requirements) ? requirements : [];

  // Group requirements by category
  const groupedByCategory = safeRequirements.reduce((acc, req) => {
    if (!acc[req.category]) {
      acc[req.category] = [];
    }
    acc[req.category].push(req);
    return acc;
  }, {} as Record<string, NonFunctionalRequirement[]>);

  const handleAddRequirement = () => {
    if (onAddRequirement) {
      onAddRequirement();
    }
  };

  const categoryColors: Record<string, { border: string; bg: string; badge: string }> = {
    Performance: {
      border: 'border-yellow-500',
      bg: 'bg-yellow-50 dark:bg-yellow-900/10',
      badge: 'bg-yellow-600'
    },
    Security: {
      border: 'border-red-500',
      bg: 'bg-red-50 dark:bg-red-900/10',
      badge: 'bg-red-600'
    },
    Usability: {
      border: 'border-green-500',
      bg: 'bg-green-50 dark:bg-green-900/10',
      badge: 'bg-green-600'
    },
    Reliability: {
      border: 'border-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-900/10',
      badge: 'bg-purple-600'
    },
    Accuracy: {
      border: 'border-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/10',
      badge: 'bg-blue-600'
    },
    Maintainability: {
      border: 'border-cyan-500',
      bg: 'bg-cyan-50 dark:bg-cyan-900/10',
      badge: 'bg-cyan-600'
    }
  };

  return (
    <Section number="5" title="Non-Functional Requirements">
      <div className="space-y-8">
        {safeRequirements.length === 0 && !isEditing && (
          <p className="text-slate-500 dark:text-slate-400 italic text-sm">
            No non-functional requirements defined yet.
          </p>
        )}
        {Object.entries(groupedByCategory).map(([category, reqs], categoryIndex) => {
          const colors = categoryColors[category] || categoryColors.Reliability;
          const subsectionNumber = `5.${categoryIndex + 1}`;
          return (
            <Subsection key={category} number={subsectionNumber} title={category}>
              <div className="space-y-4">
                {reqs.map((requirement, categoryIndex) => {
                  const globalIndex = safeRequirements.findIndex(r => r.id === requirement.id);
                  return (
                    <div
                      key={requirement.id || categoryIndex}
                      className={`border-l-4 ${colors.border} pl-4 py-3 ${colors.bg} rounded-r-lg`}
                    >
                      {isEditing ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">ID</label>
                              <input
                                type="text"
                                value={requirement.id}
                                onChange={(e) =>
                                  onUpdateRequirement(globalIndex, { ...requirement, id: e.target.value })
                                }
                                className="w-full mt-1 p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#202434] text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Priority</label>
                              <select
                                value={requirement.priority}
                                onChange={(e) =>
                                  onUpdateRequirement(globalIndex, { ...requirement, priority: e.target.value })
                                }
                                className="w-full mt-1 p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#202434] text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                              >
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Description</label>
                            <textarea
                              value={requirement.description}
                              onChange={(e) =>
                                onUpdateRequirement(globalIndex, { ...requirement, description: e.target.value })
                              }
                              rows={3}
                              className="w-full mt-1 p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#202434] text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                            />
                          </div>
                          {onRemoveRequirement && (
                            <button
                              onClick={() => onRemoveRequirement(globalIndex)}
                              className="text-red-500 hover:text-red-700 font-medium text-sm mt-2 flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                              Remove Requirement
                            </button>
                          )}
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`inline-block px-3 py-1 ${colors.badge} text-white text-xs font-bold rounded`}>
                              {requirement.id}
                            </span>
                            <span className={`text-xs font-bold px-2 py-1 rounded ${
                              requirement.priority === 'High'
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                : requirement.priority === 'Medium'
                                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            }`}>
                              {requirement.priority}
                            </span>
                          </div>
                          <p className="text-sm lg:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                            {requirement.description}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Subsection>
          );
        })}
      </div>
      {isEditing && (
        <button
          onClick={handleAddRequirement}
          className="text-primary hover:text-blue-700 font-medium text-sm mt-6 flex items-center gap-1"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span>
          Add Non-Functional Requirement
        </button>
      )}
    </Section>
  );
};

export default NonFunctionalRequirementsSectionNew;

