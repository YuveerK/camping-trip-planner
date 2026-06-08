import { ReactNode } from 'react';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-900 via-forest-800 to-earth-800 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <div className="text-5xl mb-3">⛺</div>
        <h1 className="text-3xl font-bold text-white tracking-tight">CampPlan</h1>
        <p className="text-forest-200 text-sm mt-1">Plan your camping trips together</p>
      </div>
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
        {children}
      </div>
    </div>
  );
}
