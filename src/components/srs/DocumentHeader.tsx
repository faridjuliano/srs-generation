import React from 'react';

interface DocumentHeaderProps {
  projectName: string;
  srsStandard: string;
  toneDetail: string;
  outputLanguage: string;
  isEditing: boolean;
  onEditToggle: () => void;
}

export const DocumentHeader: React.FC<DocumentHeaderProps> = ({
  projectName,
  srsStandard,
  toneDetail,
  outputLanguage,
  isEditing,
  onEditToggle
}) => {
  return (
    <div className="flex flex-col gap-3 lg:gap-4 mb-2 lg:mb-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-4">
        <div className="flex flex-col gap-1 lg:gap-2 min-w-0">
          <h1 className="text-xl lg:text-3xl font-black tracking-tight text-slate-900 dark:text-white truncate">
            {projectName || 'Project SRS'}
          </h1>
          <p className="text-xs lg:text-base text-slate-500 dark:text-slate-400 line-clamp-2 lg:line-clamp-none">
            Generated using {srsStandard} standard • {toneDetail} tone • {outputLanguage}
          </p>
        </div>
        <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0 w-full lg:w-auto">
          <button className="flex items-center justify-center gap-1 lg:gap-2 px-2 lg:px-4 py-2 lg:py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300 font-medium text-xs lg:text-sm flex-1 lg:flex-initial whitespace-nowrap">
            <span className="material-symbols-outlined text-sm lg:text-lg">download</span>
            <span className="hidden sm:inline">Download</span>
          </button>
          <button
            onClick={onEditToggle}
            className={`flex items-center justify-center gap-1 lg:gap-2 px-2 lg:px-4 py-2 lg:py-2.5 rounded-lg transition-colors font-medium text-xs lg:text-sm flex-1 lg:flex-initial whitespace-nowrap ${
              isEditing
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-primary hover:bg-blue-700 text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm lg:text-lg">
              {isEditing ? 'check_circle' : 'edit'}
            </span>
            <span className="hidden sm:inline">{isEditing ? 'Done' : 'Edit'}</span>
            <span className="sm:hidden">{isEditing ? 'Done' : 'Edit'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentHeader;

