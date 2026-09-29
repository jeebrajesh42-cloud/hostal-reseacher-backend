import React from 'react';

export const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3" role="status">
      <div
        className={`${sizeClasses[size]} border-primary-200 border-t-primary-600 rounded-full animate-spin`}
      />
      {text && <p className="text-secondary-500 text-sm font-medium">{text}</p>}
      <span className="sr-only">Loading content</span>
    </div>
  );
};

export const HostelCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-subtle animate-pulse">
    <div className="h-48 bg-slate-200 w-full" />
    <div className="p-5 space-y-3">
      <div className="flex justify-between items-start">
        <div className="h-5 bg-slate-200 rounded w-2/3" />
        <div className="h-5 bg-slate-200 rounded w-12" />
      </div>
      <div className="h-4 bg-slate-200 rounded w-1/3" />
      <div className="h-6 bg-slate-200 rounded w-1/2" />
      <div className="grid grid-cols-2 gap-2 pt-2">
        <div className="h-4 bg-slate-100 rounded" />
        <div className="h-4 bg-slate-100 rounded" />
        <div className="h-4 bg-slate-100 rounded" />
        <div className="h-4 bg-slate-100 rounded" />
      </div>
      <div className="pt-4 border-t border-slate-100 flex gap-2">
        <div className="h-9 bg-slate-200 rounded-lg flex-1" />
        <div className="h-9 w-9 bg-slate-200 rounded-lg" />
      </div>
    </div>
  </div>
);

export const ExpenseCardSkeleton = () => (
  <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-subtle animate-pulse flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-slate-200" />
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 rounded w-32" />
        <div className="h-3 bg-slate-100 rounded w-20" />
      </div>
    </div>
    <div className="space-y-2 text-right">
      <div className="h-5 bg-slate-200 rounded w-16" />
      <div className="h-3 bg-slate-100 rounded w-12 ml-auto" />
    </div>
  </div>
);

export default LoadingSpinner;
