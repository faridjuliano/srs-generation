"use client"
import {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import {getCurrentUser} from "@/lib/auth";

export default function RecentSrs() {
  const params = useParams<{ userId: string; projectId: string }>();
  const getUserInfo = getCurrentUser();
  const userId = getUserInfo?.userId;
  const router = useRouter();
  const projectIdParams = params.projectId;

  const [projectList, setProjectList] = useState<any[]>([]);

  const getProjectList = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/projects/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) {
        console.error('Failed to fetch projects:', data.error || res.statusText);
        return;
      }
      setProjectList(data.projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  }
  useEffect(() => {
    if (userId) {
      getProjectList();
    }
  }, [userId]);

  const onClickProject = (projectId: string) => {
    if (projectId === projectIdParams) {
      return
    } else {
      router.push(`/requirement-result/${projectId}`);
    }
  }

  if (!projectList) {
    return <div>Loading...</div>;
  }
  return (
    <div className="flex h-[300px] min-h-0 flex-col p-4">
      <h4 className="shrink-0 font-semibold text-slate-900 dark:text-white">
        Recently Generated:
      </h4>

      <div className="mt-2 min-h-0 flex-1 overflow-y-auto pr-1">
        {projectList.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No recent SRS found.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {projectList.map((project) => (
                <button
                  type="button"
                  key={project.projectId}
                  onClick={() => onClickProject(project.projectId)}
                  className="w-full cursor-pointer rounded-lg bg-slate-200 p-2 text-center text-sm font-medium text-slate-900 hover:bg-slate-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                >
                <span className="block truncate">
                  {project.projectName}
                </span>
                </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}