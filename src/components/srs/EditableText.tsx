import React from 'react';

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  isEditing: boolean;
  rows?: number;
  className?: string;
}

export const EditableText: React.FC<EditableTextProps> = ({
  value,
  onChange,
  isEditing,
  rows = 4,
  className = ''
}) => {
  return isEditing ? (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full p-2 lg:p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#202434] text-sm lg:text-base text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none ${className}`}
      rows={rows}
    />
  ) : (
    <p className={`text-sm lg:text-base text-slate-600 dark:text-slate-400 leading-relaxed ${className}`}>
      {value}
    </p>
  );
};

export default EditableText;

