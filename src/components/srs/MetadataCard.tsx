import React from 'react';

interface MetadataCardProps {
  label: string;
  value: string;
}

export const MetadataCard: React.FC<MetadataCardProps> = ({ label, value }) => {
  return (
    <div className="p-3 lg:p-4 bg-slate-50 dark:bg-[#202434] rounded-lg border border-slate-200 dark:border-slate-700">
      <p className="text-xs lg:text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-base lg:text-lg font-bold text-slate-900 dark:text-white truncate">
        {value}
      </p>
    </div>
  );
};

interface MetadataGridProps {
  items: MetadataCardProps[];
  columns?: number;
}

export const MetadataGrid: React.FC<MetadataGridProps> = ({ items, columns = 2 }) => {
  const gridClass = columns === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1';

  return (
    <div className={`grid ${gridClass} gap-2 lg:gap-4`}>
      {items.map((item, index) => (
        <MetadataCard key={index} label={item.label} value={item.value} />
      ))}
    </div>
  );
};

export default { MetadataCard, MetadataGrid };

