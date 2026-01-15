import React from 'react';

interface DocumentActionButtonProps {
  icon: string;
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const DocumentActionButton: React.FC<DocumentActionButtonProps> = ({
  icon,
  label,
  onClick,
  variant = 'secondary',
  disabled = false
}) => {
  const baseClasses = 'flex items-center justify-center gap-1 lg:gap-2 px-2 lg:px-4 py-2 lg:py-2.5 rounded-lg transition-colors font-medium text-xs lg:text-sm flex-1 lg:flex-initial whitespace-nowrap';

  const variantClasses = {
    primary: 'bg-primary hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary',
    secondary: 'border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      <span className="material-symbols-outlined text-sm lg:text-lg">{icon}</span>
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{label.split(' ')[0]}</span>
    </button>
  );
};

interface ActionButtonGroupProps {
  buttons: DocumentActionButtonProps[];
  direction?: 'row' | 'col';
}

export const ActionButtonGroup: React.FC<ActionButtonGroupProps> = ({
  buttons,
  direction = 'row'
}) => {
  const directionClass = direction === 'row' ? 'flex-row' : 'flex-col';

  return (
    <div className={`flex ${directionClass} gap-2 lg:gap-4 items-stretch`}>
      {buttons.map((button, index) => (
        <DocumentActionButton key={index} {...button} />
      ))}
    </div>
  );
};

export default { DocumentActionButton, ActionButtonGroup };

