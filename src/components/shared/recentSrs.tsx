"use client"
import {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";

export default function RecentSrs() {
  const params = useParams<{ userId: string; projectId: string }>();
  const userId = params.userId;
  const router = useRouter();
  const projectIdParams = params.projectId;

  const [projectList, setProjectList] = useState<any[]>([]);

  const getProjectList = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/projects/users/${userId}`, {
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
    getProjectList();
  }, []);

  const onClickProject = (projectId: string) => {
    if (projectId === projectIdParams) {
      return
    } else {
      router.push(`/fr-nfr-detailed-result/${userId}/${projectId}`);
    }
  }

  if (!projectList) {
    return <div>Loading...</div>;
  }
  return (
    <div className="p-4">
      <h4 className="font-semibold text-slate-900 dark:text-white">Recently Generated:</h4>
      <div className="mt-2 flex flex-col gap-2 max-h-1/2 h-fit">
        {projectList?.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No recent SRS found.</p>
        ) : (
          <div className="flex flex-col gap-2">
          {
            projectList.map((project: any) => (
              <div onClick={() => onClickProject(project.projectId)} key={project.projectId} className=" ml-1 cursor-pointer rounded-lg bg-slate-200 ">
                <h3 className="text-sm font-medium  px-1 py-2 text-slate-900 dark:text-white text-ellipsis text-center">
                  {project.projectName}
                </h3>
              </div>
            ))
          }
          </div>
          )}
      </div>
    </div>
  );
}