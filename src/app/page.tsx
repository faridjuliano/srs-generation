'use client';

import { useRouter } from 'next/navigation';
import {useEffect, useState} from 'react';
import Modal from '@/components/shared/Modal';

export default function Home() {
  const router = useRouter();
  const [projectName, setProjectName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState<string | undefined>(undefined);
  const [modalMessage, setModalMessage] = useState<string | undefined>(undefined);

  useEffect(() => {
    router.push('/login');
  }, [router]);

  const handleStartCreating = () => {
    if (!projectName.trim()) {
      setModalTitle('Missing name');
      setModalMessage('Please enter an author name');
      setModalOpen(true);
      return;
    }

    setIsLoading(true);
    // Store the author name in session storage
    sessionStorage.setItem('srs-author-name', projectName);
    router.push('/new-fr-nfr-detailed');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading && projectName.trim()) {
      handleStartCreating();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Welcome Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 lg:p-12 space-y-8">
          {/* Logo/Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-3xl text-white">auto_awesome</span>
            </div>
          </div>

          {/* Welcome Message */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              SRS Generator
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-base lg:text-lg">
              Create comprehensive Software Requirements Specifications with AI assistance
            </p>
          </div>

          {/* Input Section */}
          <div className="space-y-4">
            <div>
              <label htmlFor="projectName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Author Name
              </label>
              <input
                id="projectName"
                type="text"
                placeholder="Enter author name..."
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
              />
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStartCreating}
            disabled={isLoading || !projectName.trim()}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              isLoading || !projectName.trim()
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 shadow-lg hover:shadow-xl active:scale-95'
            }`}
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                <span>Starting...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">arrow_forward</span>
                <span>Start Creating</span>
              </>
            )}
          </button>

          {/* Footer Text */}
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Get ready to create detailed functional and non-functional requirements
          </p>
        </div>
      </div>
          <Modal
            isOpen={modalOpen}
            title={modalTitle}
            message={modalMessage}
            onPrimary={() => setModalOpen(false)}
            onClose={() => setModalOpen(false)}
          />
    </div>
  );
}
