"use client";

import { useLogout } from '@/hooks/useAuth';

export function LogoutBtn() {
  const logout = useLogout();

  return (
	<div className="mt-auto p-4 border-t border-[#e7e9f3] dark:border-[#2a2e3b]">
	  <button
		type="button"
		onClick={logout}
		className="cursor-pointer w-full inline-flex items-center justify-center gap-2 bg-red-600 text-white px-3 py-2.5 rounded-lg hover:bg-red-800 transition-colors text-sm font-medium"
	  >
		<span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
		<span>Logout</span>
	  </button>
	</div>
  );
}

export default LogoutBtn;


