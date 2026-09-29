import React from 'react';
import HostelCard from './HostelCard';
import { HostelCardSkeleton } from './LoadingSpinner';
import EmptyState from './EmptyState';
import { ExternalLink, Globe, Search } from 'lucide-react';

const HostelGrid = ({
  hostels = [],
  loading = false,
  onResetFilters = null,
  searchQuery = '',
  onLiveSearch = null,
  searchingLive = false
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <HostelCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!hostels || hostels.length === 0) {
    const gmapsSearchUrl = searchQuery
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`
      : null;

    return (
      <div className="space-y-6">
        {searchQuery ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-card text-center max-w-xl mx-auto space-y-4 animate-fade-in">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-secondary-900">
              Looking for "{searchQuery}"?
            </h3>
            <p className="text-xs text-secondary-600 leading-relaxed max-w-md mx-auto">
              Search <strong>"{searchQuery}"</strong> directly on Google Maps Live to view real-time student reviews, photos, location, and owner contacts.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={gmapsSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <span>📍 Search on Google Maps Live ↗</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              {onLiveSearch && (
                <button
                  type="button"
                  onClick={onLiveSearch}
                  disabled={searchingLive}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  <span>{searchingLive ? 'Searching...' : 'Search Live Map 🌐'}</span>
                </button>
              )}
            </div>
            {onResetFilters && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="text-xs text-secondary-500 hover:text-secondary-800 font-semibold underline cursor-pointer"
                >
                  Reset all filters & search
                </button>
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            icon="search"
            title="No hostels found"
            description="We couldn't find any hostels matching your specific filters or location radius. Try broadening your criteria."
            actionLabel={onResetFilters ? 'Reset Filters' : null}
            onAction={onResetFilters}
          />
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {hostels.map((hostel) => (
        <HostelCard key={hostel.id} hostel={hostel} />
      ))}
    </div>
  );
};

export default HostelGrid;
