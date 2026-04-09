import React from 'react';
import { Section, Subsection } from '../SectionHeading';

interface FunctionalRequirement {
  id: string;
  title: string;
  description: string;
  priority: string;
}

interface FunctionalRequirementsSectionProps {
  requirements: FunctionalRequirement[];
  isEditing: boolean;
  onUpdateRequirement: (index: number, requirement: FunctionalRequirement) => void;
  onAddRequirement?: () => void;
  onRemoveRequirement?: (index: number) => void;
}

export const FunctionalRequirementsSection: React.FC<FunctionalRequirementsSectionProps> = ({
  requirements = [],
  isEditing,
  onUpdateRequirement,
  onAddRequirement,
  onRemoveRequirement
}) => {
  const safeRequirements = Array.isArray(requirements) ? requirements : [];

  const handleAddRequirement = () => {
    if (onAddRequirement) {
      onAddRequirement();
    }
  };

  return (
    <Section number="4" title="System Requirements">
      <Subsection number="4.1" title="Functional Requirements">
        <div className="space-y-6">
          {safeRequirements.length === 0 && !isEditing && (
            <p className="text-slate-500 dark:text-slate-400 italic text-sm">
              No functional requirements defined yet.
            </p>
          )}
          {safeRequirements.map((requirement, index) => (
            <div
              key={requirement.id || index}
              className="border-l-4 border-blue-500 pl-4 py-3 bg-blue-50 dark:bg-blue-900/10 rounded-r-lg"
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
                          onUpdateRequirement(index, { ...requirement, id: e.target.value })
                        }
                        className="w-full mt-1 p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#202434] text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Priority</label>
                      <select
                        value={requirement.priority}
                        onChange={(e) =>
                          onUpdateRequirement(index, { ...requirement, priority: e.target.value })
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
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Title</label>
                    <input
                      type="text"
                      value={requirement.title}
                      onChange={(e) =>
                        onUpdateRequirement(index, { ...requirement, title: e.target.value })
                      }
                      className="w-full mt-1 p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#202434] text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Description</label>
                    <textarea
                      value={requirement.description}
                      onChange={(e) =>
                        onUpdateRequirement(index, { ...requirement, description: e.target.value })
                      }
                      rows={3}
                      className="w-full mt-1 p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#202434] text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                    />
                  </div>
                  {onRemoveRequirement && (
                    <button
                      onClick={() => onRemoveRequirement(index)}
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
                    <span className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded">
                      {requirement.id}
                    </span>
                    <h4 className="text-base lg:text-lg font-semibold text-slate-900 dark:text-white">
                      {requirement.title}
                    </h4>
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
          ))}
          {isEditing && (
            <button
              onClick={handleAddRequirement}
              className="text-primary hover:text-blue-700 font-medium text-sm mt-4 flex items-center gap-1"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span>
              Add Functional Requirement
            </button>
          )}
        </div>
      </Subsection>
    </Section>
  );
};

export default FunctionalRequirementsSection;

