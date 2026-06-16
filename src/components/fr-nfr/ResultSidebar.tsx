import Link from 'next/link';
import RecentSrs from "@/components/shared/recentSrs";
import LogoutBtn from "@/components/shared/logoutBtn";

type SidebarProps = {
  isOpen: boolean;
  onToggle: () => void;
};

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  return (
    <>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={onToggle}
        />
      )}

      <aside
        className={`flex flex-col w-64 h-full bg-[#f8f9fc] dark:bg-[#161926] border-r border-[#e7e9f3] dark:border-[#2a2e3b] flex-shrink-0 fixed lg:static inset-y-0 left-0 z-40 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <aside className="flex flex-col justify-between w-64 h-full bg-[#f8f9fc] dark:bg-[#161926] border-r border-[#e7e9f3] dark:border-[#2a2e3b] flex-shrink-0">
          <div className="">
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded bg-primary flex items-center justify-center text-white">
                  <span className="material-symbols-outlined">description</span>
                </div>
                <h1 className="text-lg font-bold tracking-tight">SRS Generator</h1>
              </div>
            </div>
            <div className="px-4">
              <Link
                href="/new-requirement"
                className="w-full inline-flex items-center gap-2 bg-primary text-white px-3 py-2.5 rounded-lg shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add_circle</span>
                <span className="text-sm font-bold">Generate Functional and Non-Functional Requirement</span>
              </Link>
            </div>
          </div>
          <div className="overflow-y-auto h-full">
            <RecentSrs/>
          </div>
          <LogoutBtn />
        </aside>
      </aside>
    </>
  );
}

