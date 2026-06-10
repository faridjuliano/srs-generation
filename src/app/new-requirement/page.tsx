"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import type {
  NfNfrDetailedFeature,
  NfNfrDetailedGenerateRequest,
  NfNfrDetailedGenerateResponse,
} from "@/lib/nfNfrDetailedTypes";

import RecentSrs from "@/components/shared/recentSrs";
import LogoutBtn from "@/components/shared/logoutBtn";

function createEmptyNfNfrDetailedFeature(): NfNfrDetailedFeature {
  return { name: "", description: "" };
}

function hasWhitespace(value: string): boolean {
  return /\s/.test(value);
}

export default function NewNfNfrDetailedPage() {
  const router = useRouter();

  const [nfNfrDetailedUserId, setNfNfrDetailedUserId] = useState("");
  const [nfNfrDetailedProjectId, setNfNfrDetailedProjectId] = useState("");

  const [nfNfrDetailedProjectName, setNfNfrDetailedProjectName] = useState(
    ""
    // 'Hospital Booking System'
  );

  const [
    nfNfrDetailedProjectDescription,
    setNfNfrDetailedProjectDescription,
  ] = useState(
    ""
    // 'A web-based system for booking, rescheduling, and cancelling doctor appointments.'
  );

  const [nfNfrDetailedFeatures, setNfNfrDetailedFeatures] = useState<
    NfNfrDetailedFeature[]
  >([
    createEmptyNfNfrDetailedFeature(),
    // {
    //   name: 'Appointment Booking',
    //   description: 'Patients can book appointments with available doctors.'
    // },
    // {
    //   name: 'Appointment Management',
    //   description: 'Patients can reschedule or cancel appointments.'
    // },
    // {
    //   name: 'Doctor Schedule View',
    //   description: 'Doctors can view their daily appointment schedule.'
    // }
  ]);

  const [nfNfrDetailedConstraints, setNfNfrDetailedConstraints] = useState<
    string[]
  >([
    // 'Must support 500 concurrent users'
  ]);

  const [nfNfrDetailedAssumptions, setNfNfrDetailedAssumptions] = useState<
    string[]
  >([
    // 'Users have stable internet connection'
  ]);

  const nfNfrDetailedSupportingSections = useMemo(
    () => [
      {
        title: "Constraints",
        items: nfNfrDetailedConstraints,
        setter: setNfNfrDetailedConstraints,
      },
      {
        title: "Assumptions",
        items: nfNfrDetailedAssumptions,
        setter: setNfNfrDetailedAssumptions,
      },
    ],
    [nfNfrDetailedConstraints, nfNfrDetailedAssumptions]
  );

  // const [nfNfrDetailedSupportingSections] = useState([
  //   { title: 'Constraints', items: nfNfrDetailedConstraints, setter: setNfNfrDetailedConstraints },
  //   { title: 'Assumptions', items: nfNfrDetailedAssumptions, setter: setNfNfrDetailedAssumptions }
  // ]);

  const [isGeneratingNfNfrDetailed, setIsGeneratingNfNfrDetailed] =
    useState(false);

  const [nfNfrDetailedError, setNfNfrDetailedError] = useState<string | null>(
    null
  );

  const [showRequiredWarnings, setShowRequiredWarnings] = useState(false);

  // Retrieve author name from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const authorName = sessionStorage.getItem("srs-author-name");

      if (authorName) {
        setNfNfrDetailedUserId(authorName);
      }
    }
  }, []);

  useEffect(() => {
    try {
      const data = localStorage.getItem("user");

      if (data != null) {
        const parsedUser = JSON.parse(data);

        if (parsedUser?.userId) {
          setNfNfrDetailedUserId(parsedUser.userId);
        }
      }
    } catch {
      setNfNfrDetailedUserId("");
    }
  }, []);

  const isUserIdMissing = nfNfrDetailedUserId.trim().length === 0;
  const isUserIdInvalid = hasWhitespace(nfNfrDetailedUserId.trim());

  const isProjectIdInvalid =
    nfNfrDetailedProjectId.trim().length > 0 &&
    hasWhitespace(nfNfrDetailedProjectId.trim());

  const isProjectNameMissing = nfNfrDetailedProjectName.trim().length === 0;

  const isProjectDescriptionMissing =
    nfNfrDetailedProjectDescription.trim().length === 0;

  const hasAtLeastOneFeature = nfNfrDetailedFeatures.length > 0;

  const hasInvalidFeature = nfNfrDetailedFeatures.some(
    (feature) =>
      feature.name.trim().length === 0 ||
      feature.description.trim().length === 0
  );

  const isFeatureMissing = !hasAtLeastOneFeature || hasInvalidFeature;

  const canSubmit = useMemo(() => {
    return (
      nfNfrDetailedUserId.trim().length > 0 &&
      !hasWhitespace(nfNfrDetailedUserId.trim()) &&
      !isProjectIdInvalid &&
      nfNfrDetailedProjectName.trim().length > 0 &&
      nfNfrDetailedProjectDescription.trim().length > 0 &&
      !isFeatureMissing
    );
  }, [
    nfNfrDetailedProjectDescription,
    nfNfrDetailedProjectId,
    nfNfrDetailedProjectName,
    nfNfrDetailedUserId,
    isProjectIdInvalid,
    isFeatureMissing,
  ]);

  const updateNfNfrDetailedFeature = (
    index: number,
    field: keyof NfNfrDetailedFeature,
    value: string
  ) => {
    setNfNfrDetailedFeatures((prev) =>
      prev.map((feature, itemIndex) =>
        itemIndex === index ? { ...feature, [field]: value } : feature
      )
    );
  };

  const addNfNfrDetailedFeature = () => {
    setNfNfrDetailedFeatures((prev) => [
      ...prev,
      createEmptyNfNfrDetailedFeature(),
    ]);
  };

  const removeNfNfrDetailedFeature = (index: number) => {
    setNfNfrDetailedFeatures((prev) =>
      prev.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const handleGenerateNfNfrDetailed = async () => {
    if (
      isUserIdMissing ||
      isUserIdInvalid ||
      isProjectIdInvalid ||
      isProjectNameMissing ||
      isProjectDescriptionMissing ||
      isFeatureMissing
    ) {
      setShowRequiredWarnings(true);
      return;
    }

    setIsGeneratingNfNfrDetailed(true);
    setShowRequiredWarnings(false);
    setNfNfrDetailedError(null);

    try {
      const validFeatures = nfNfrDetailedFeatures.map((feature) => ({
        name: feature.name.trim(),
        description: feature.description.trim(),
      }));

      const payload: NfNfrDetailedGenerateRequest = {
        userId: nfNfrDetailedUserId.trim(),
        projectId: nfNfrDetailedProjectId.trim(),
        project_name: nfNfrDetailedProjectName.trim(),
        project_description: nfNfrDetailedProjectDescription.trim(),
        features: validFeatures,
        constraints: nfNfrDetailedConstraints
          .map((item) => item.trim())
          .filter(Boolean),
        assumptions: nfNfrDetailedAssumptions
          .map((item) => item.trim())
          .filter(Boolean),
      };

      const response = await fetch("/api/srs/fr-nfr-detailed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response
        .json()
        .catch(() => null)) as NfNfrDetailedGenerateResponse | null;

      console.log(data, response, "data");

      if (!response.ok || !data?.success) {
        setNfNfrDetailedError(
          data?.error || "Failed to generate the detailed FR/NFR content."
        );
        return;
      }

      router.push(
        `/requirement-result/${encodeURIComponent(
          nfNfrDetailedUserId.trim()
        )}/${encodeURIComponent(data.projectId as string)}`
      );
    } catch (err) {
      setNfNfrDetailedError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setIsGeneratingNfNfrDetailed(false);
    }
  };

  const setStringListValue = (
    setter: Dispatch<SetStateAction<string[]>>,
    index: number,
    value: string
  ) => {
    setter((prev) =>
      prev.map((item, itemIndex) => (itemIndex === index ? value : item))
    );
  };

  const addListItem = (setter: Dispatch<SetStateAction<string[]>>) => {
    setter((prev) => [...prev, ""]);
  };

  const removeListItem = (
    setter: Dispatch<SetStateAction<string[]>>,
    index: number
  ) => {
    setter((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <aside className="hidden lg:flex flex-col justify-between w-64 h-full bg-[#f8f9fc] dark:bg-[#161926] border-r border-[#e7e9f3] dark:border-[#2a2e3b] flex-shrink-0">
        <div className="">
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded bg-primary flex items-center justify-center text-white">
                <span className="material-symbols-outlined">description</span>
              </div>
              <h1 className="text-lg font-bold tracking-tight">
                SRS Generator
              </h1>
            </div>
          </div>

          <div className="px-4">
            <Link
              href="/new-requirement"
              className="w-full inline-flex items-center gap-2 bg-primary text-white px-3 py-2.5 rounded-lg shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "20px" }}
              >
                add_circle
              </span>
              <span className="text-sm font-bold">
                Generate Functional and Non-Functional Requirement
              </span>
            </Link>
          </div>

          <RecentSrs />
        </div>

        <LogoutBtn />
      </aside>

      <main className="flex flex-col flex-1 min-w-0 bg-background-light dark:bg-background-dark">
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 bg-white dark:bg-[#161926] border-b border-[#e7e9f3] dark:border-[#2a2e3b]">
          <nav className="flex text-xs lg:text-sm text-slate-500 dark:text-slate-400 truncate">
            <span className="text-slate-900 dark:text-white font-medium text-xs lg:text-sm">
              Functional and Non-Functional Requirement Generator
            </span>
          </nav>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-4xl mx-auto bg-white dark:bg-[#1a1d2d] rounded-xl border border-[#e7e9f3] dark:border-[#2a2e3b] shadow-sm p-4 lg:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Generate Functional and Non-Functional Requirement
              </h2>

              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Use Gemini to generate SRS Functional and Non-Functional
                Requirement content aligned with ISO/IEC/IEEE 29148:2018
                standards.
              </p>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/*<div>*/}
                {/*  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">*/}
                {/*    Author Name <span className="text-rose-600">*</span>*/}
                {/*  </label>*/}
                {/*  <input*/}
                {/*    type="text"*/}
                {/*    value={nfNfrDetailedUserId}*/}
                {/*    onChange={e => setNfNfrDetailedUserId(e.target.value)}*/}
                {/*    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#202434] px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"*/}
                {/*    placeholder="Your author name"*/}
                {/*  />*/}
                {/*  {showRequiredWarnings && isUserIdMissing && (*/}
                {/*    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">Author name is required.</p>*/}
                {/*  )}*/}
                {/*  {showRequiredWarnings && isUserIdInvalid && !isUserIdMissing && (*/}
                {/*    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">Author name cannot contain spaces.</p>*/}
                {/*  )}*/}
                {/*</div>*/}

                {/*<div>*/}
                {/*  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">*/}
                {/*    Project ID (Optional, will be auto-generated if left blank)*/}
                {/*  </label>*/}
                {/*  <input*/}
                {/*    type="text"*/}
                {/*    value={nfNfrDetailedProjectId}*/}
                {/*    onChange={e => setNfNfrDetailedProjectId(e.target.value)}*/}
                {/*    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#202434] px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"*/}
                {/*    placeholder="project-001"*/}
                {/*  />*/}
                {/*  {showRequiredWarnings && isProjectIdInvalid && (*/}
                {/*    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">Project ID cannot contain spaces.</p>*/}
                {/*  )}*/}
                {/*</div>*/}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Project Name <span className="text-rose-600">*</span>
                </label>

                <input
                  type="text"
                  value={nfNfrDetailedProjectName}
                  onChange={(e) =>
                    setNfNfrDetailedProjectName(e.target.value)
                  }
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#202434] px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                />

                {showRequiredWarnings && isProjectNameMissing && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                    Project name is required.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Project Description <span className="text-rose-600">*</span>
                </label>

                <textarea
                  value={nfNfrDetailedProjectDescription}
                  onChange={(e) =>
                    setNfNfrDetailedProjectDescription(e.target.value)
                  }
                  rows={5}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#202434] px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 resize-y"
                />

                {showRequiredWarnings && isProjectDescriptionMissing && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                    Project description is required.
                  </p>
                )}
              </div>

              <section className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Features <span className="text-rose-600">*</span>
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Add at least one complete feature with a name and
                      description.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addNfNfrDetailedFeature}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <span className="material-symbols-outlined text-base">
                      add
                    </span>
                    Add Feature
                  </button>
                </div>

                {showRequiredWarnings && isFeatureMissing && (
                  <p className="text-xs text-rose-600 dark:text-rose-400">
                    At least one complete feature is required.
                  </p>
                )}

                <div className="space-y-4">
                  {nfNfrDetailedFeatures.map((feature, index) => (
                    <article
                      key={`feature-${index}`}
                      className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="font-semibold text-slate-900 dark:text-white">
                          Feature {index + 1}
                        </h4>

                        {nfNfrDetailedFeatures.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              removeNfNfrDetailedFeature(index)
                            }
                            className="cursor-pointer text-sm text-rose-600 hover:text-rose-700"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                          Name <span className="text-rose-600">*</span>
                        </label>

                        <input
                          type="text"
                          value={feature.name}
                          onChange={(e) =>
                            updateNfNfrDetailedFeature(
                              index,
                              "name",
                              e.target.value
                            )
                          }
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#202434] px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />

                        {showRequiredWarnings &&
                          feature.name.trim().length === 0 && (
                            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                              Feature name is required.
                            </p>
                          )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                          Description{" "}
                          <span className="text-rose-600">*</span>
                        </label>

                        <textarea
                          value={feature.description}
                          onChange={(e) =>
                            updateNfNfrDetailedFeature(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          rows={3}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#202434] px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 resize-y"
                        />

                        {showRequiredWarnings &&
                          feature.description.trim().length === 0 && (
                            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                              Feature description is required.
                            </p>
                          )}
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              {nfNfrDetailedSupportingSections.map((section) => (
                <div
                  key={section.title}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 p-4"
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {section.title}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Optional supporting statements for the generator.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => addListItem(section.setter)}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <span className="material-symbols-outlined text-base">
                        add
                      </span>
                      Add {section.title.slice(0, -1)}
                    </button>
                  </div>

                  <div className="space-y-3 mt-4">
                    {section.items.length === 0 && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        No {section.title.toLowerCase()} added.
                      </p>
                    )}

                    {section.items.map((item, index) => (
                      <div
                        key={`${section.title}-${index}`}
                        className="flex gap-2"
                      >
                        <input
                          type="text"
                          value={item}
                          onChange={(e) =>
                            setStringListValue(
                              section.setter,
                              index,
                              e.target.value
                            )
                          }
                          className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#202434] px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeListItem(section.setter, index)
                          }
                          className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {nfNfrDetailedError && (
                <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-300">
                  {nfNfrDetailedError}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleGenerateNfNfrDetailed}
                  disabled={isGeneratingNfNfrDetailed || !canSubmit}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingNfNfrDetailed && (
                    <span className="material-symbols-outlined animate-spin text-base">
                      refresh
                    </span>
                  )}

                  {isGeneratingNfNfrDetailed
                    ? "Generating..."
                    : "Generate FR & NFR"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}