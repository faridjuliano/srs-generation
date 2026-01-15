import React from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  router: any;
  children?: React.ReactNode;
  position?: 'left' | 'right';
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  projectName,
  router,
  children,
  position = 'left'
}) => {
  const positionClasses = position === 'left'
    ? 'left-0 -translate-x-full lg:translate-x-0'
    : 'right-0 translate-x-full lg:translate-x-0';

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`flex flex-col ${position === 'left' ? 'w-64' : 'w-full sm:w-80'} h-full bg-[#f8f9fc] dark:bg-[#161926] border-${position === 'left' ? 'r' : 'l'} border-[#e7e9f3] dark:border-[#2a2e3b] flex-shrink-0 fixed lg:static inset-y-0 ${positionClasses} z-40 transform transition-transform duration-300 overflow-hidden`}>
        {/* Close button for mobile */}
        {position === 'right' && (
          <button
            onClick={onClose}
            className="lg:hidden absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 z-10"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        )}

        {children}
      </aside>
    </>
  );
};

export default Sidebar;

