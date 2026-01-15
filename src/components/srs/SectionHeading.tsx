import React from 'react';

interface SectionHeadingProps {
  number?: string | number;
  title: string;
  level?: 'h1' | 'h2' | 'h3';
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  number,
  title,
  level = 'h2',
  className = ''
}) => {
  const headingClasses = {
    h1: 'text-xl lg:text-3xl',
    h2: 'text-lg lg:text-2xl',
    h3: 'text-base lg:text-lg'
  };

  const Heading = level as any;
  const headingClass = headingClasses[level];

  return (
    <Heading className={`${headingClass} font-bold text-slate-900 dark:text-white ${className}`}>
      {number && `${number}. `}{title}
    </Heading>
  );
};

interface SectionProps {
  number?: string | number;
  title: string;
  children: React.ReactNode;
  withBorder?: boolean;
  className?: string;
}

export const Section: React.FC<SectionProps> = ({
  number,
  title,
  children,
  withBorder = true,
  className = ''
}) => {
  return (
    <div className={`mb-6 lg:mb-10 ${className}`}>
      {withBorder ? (
        <>
          <SectionHeading number={number} title={title} level="h2" className="mb-3 lg:mb-4 pb-2 lg:pb-3 border-b border-slate-200 dark:border-slate-700" />
          <div className="space-y-4 lg:space-y-6">
            {children}
          </div>
        </>
      ) : (
        <>
          <SectionHeading number={number} title={title} level="h2" className="mb-3 lg:mb-4" />
          <div className="space-y-4 lg:space-y-6">
            {children}
          </div>
        </>
      )}
    </div>
  );
};

interface SubsectionProps {
  number: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const Subsection: React.FC<SubsectionProps> = ({
  number,
  title,
  children,
  className = ''
}) => {
  return (
    <div className={className}>
      <SectionHeading number={number} title={title} level="h3" className="mb-2 lg:mb-3" />
      {children}
    </div>
  );
};

export default { SectionHeading, Section, Subsection };

