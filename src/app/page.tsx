'use client';

import { useRouter } from 'next/navigation';
import {useEffect, useState} from "react";

export default function Home() {
  const router = useRouter();
  const [isToken, setIsToken] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsToken(true)
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Welcome Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 lg:p-12 space-y-8">
          {/* Logo/Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-3xl text-white">
                auto_awesome
              </span>
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

          {isToken ? (
            <div className="text-center">
              <button
                onClick={() => router.push('/new-requirement')}
                className="cursor-pointer w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 shadow-lg hover:shadow-xl active:scale-95"
              >
                <span className="material-symbols-outlined">login</span>
                <span>New Requirement</span>
              </button>

            </div>
          ) :
            <>
              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={() => router.push('/login')}
                  className="cursor-pointer w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 shadow-lg hover:shadow-xl active:scale-95"
                >
                  <span className="material-symbols-outlined">login</span>
                  <span>Login</span>
                </button>

                <button
                  onClick={() => router.push('/register')}
                  className="cursor-pointer w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 active:scale-95"
                >
                  <span className="material-symbols-outlined">person_add</span>
                  <span>Register</span>
                </button>
              </div>
            </>
          }


          {/* Footer Text */}
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Login or create an account to start generating functional and non-functional requirements
          </p>
        </div>
      </div>
    </div>
  );
}