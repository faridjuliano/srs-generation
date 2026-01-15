import React from 'react';

interface SystemFeatureProps {
  id: string;
  description: string;
  functionalRequirements: string[];
  isEditing: boolean;
  onUpdateDescription: (newDescription: string) => void;
  onUpdateRequirements: (newRequirements: string[]) => void;
}

export const SystemFeature: React.FC<SystemFeatureProps> = ({
  id,
  description,
  functionalRequirements,
  isEditing,
  onUpdateDescription,
  onUpdateRequirements
}) => {
  const handleRequirementChange = (index: number, value: string) => {
    const updated = [...functionalRequirements];
    updated[index] = value;
    onUpdateRequirements(updated);
  };

  const handleRemoveRequirement = (index: number) => {
    const updated = functionalRequirements.filter((_, i) => i !== index);
    onUpdateRequirements(updated);
  };

  const handleAddRequirement = () => {
    onUpdateRequirements([...functionalRequirements, '']);
  };

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 lg:p-5 bg-slate-50 dark:bg-[#202434]">
      <h3 className="text-base lg:text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2 lg:mb-3">
        {id}. {isEditing ? (
          <input
            type="text"
            value={description}
            onChange={(e) => onUpdateDescription(e.target.value)}
            className="inline p-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#1a1d2d] text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary w-96"
          />
        ) : (
          description
        )}
      </h3>
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Functional Requirements:</p>
        {isEditing ? (
          <div className="space-y-2">
            {functionalRequirements.map((req, reqIndex) => (
              <div key={reqIndex} className="flex gap-3 items-start">
                <input
                  type="text"
                  value={req}
                  onChange={(e) => handleRequirementChange(reqIndex, e.target.value)}
                  className="flex-1 p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#1a1d2d] text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                />
                <button
                  onClick={() => handleRemoveRequirement(reqIndex)}
                  className="text-slate-400 hover:text-red-500 transition-colors p-2 flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            ))}
            <button
              onClick={handleAddRequirement}
              className="text-primary hover:text-blue-700 font-medium text-sm flex items-center gap-1"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add_circle</span>
              Add Requirement
            </button>
          </div>
        ) : (
          <ul className="space-y-2 ml-3">
            {functionalRequirements.map((req, reqIndex) => (
              <li key={reqIndex} className="flex gap-3 text-sm text-slate-600 dark:text-slate-400">
                <span className="text-primary font-bold mt-0.5">•</span>
                <span>{req}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SystemFeature;

