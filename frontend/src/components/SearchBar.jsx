import React, { useState, useEffect } from 'react';
import { Search, MapPin, Navigation, X, Target, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';

const POPULAR_CITIES = [
  'All Cities',
  'Bhopal',
  'Kota',
  'Bangalore',
  'Pune',
  'Delhi',
  'Indore',
  'Hyderabad',
  'Mumbai'
];

const SearchBar = ({
  onSearch,
  initialValue = '',
  selectedCity = 'All Cities',
  onCityChange,
  isNearestActive = false,
  onToggleNearest = null
}) => {
  const [query, setQuery] = useState(initialValue || '');
  const { requestBrowserLocation, userCoordinates, setLocationByCity, setIsLocationModalOpen, openInGoogleMaps } = useApp();

  // Sync with initialValue when URL or filter changes
  useEffect(() => {
    setQuery(initialValue || '');
  }, [initialValue]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  const handleCitySelect = (city) => {
    if (city !== 'All Cities' && city !== 'all') {
      setLocationByCity(city);
    }
    if (onCityChange) {
      onCityChange(city);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl p-2.5 shadow-card border border-slate-200/80">
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
        {/* City Selector */}
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200/80 shrink-0">
          <MapPin className="w-4 h-4 text-primary-600 shrink-0" />
          <select
            value={selectedCity}
            onChange={(e) => handleCitySelect(e.target.value)}
            className="bg-transparent text-sm font-semibold text-secondary-900 focus:outline-none cursor-pointer pr-2"
            aria-label="Select City"
          >
            {POPULAR_CITIES.map((c) => (
              <option key={c} value={c === 'All Cities' ? 'all' : c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* College / Coaching Area Hub Button */}
        <button
          type="button"
          onClick={() => setIsLocationModalOpen(true)}
          className="flex items-center justify-between sm:justify-start gap-1.5 px-3 py-2 bg-primary-50/60 hover:bg-primary-100/60 rounded-xl border border-primary-200/70 text-xs font-bold text-primary-900 shrink-0 transition-colors"
          title="Click to select specific coaching center or college hub"
        >
          <div className="flex items-center gap-1.5 truncate max-w-[170px]">
            <span className="text-secondary-400 font-medium hidden sm:inline">Hub:</span>
            <span className="truncate text-primary-800">{userCoordinates.area || userCoordinates.label}</span>
          </div>
          <span className="text-[10px] text-primary-600 font-semibold underline shrink-0">Change</span>
        </button>

        {/* Search Query Input */}
        <div className="relative flex-1 flex items-center min-w-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by area, college, hostel name, landmark..."
            className="w-full pl-10 pr-9 py-2.5 bg-transparent text-sm text-secondary-900 placeholder-secondary-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Clear search query"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 1-Click Nearest Hostels Toggle Button */}
        {onToggleNearest && (
          <button
            type="button"
            onClick={onToggleNearest}
            className={`flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 ${
              isNearestActive
                ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/30'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}
            title="Sort hostels by distance (closest first)"
          >
            <Target className="w-3.5 h-3.5" />
            <span>{isNearestActive ? 'Nearest (Active)' : 'Nearest'}</span>
          </button>
        )}

        {/* GPS Geolocation Quick Button */}
        <button
          type="button"
          onClick={requestBrowserLocation}
          className={`flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 active:scale-95 ${
            userCoordinates.hasLocation
              ? 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
              : 'bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200'
          }`}
          title="Use device GPS to calculate exact distances to hostels"
        >
          <Navigation className={`w-3.5 h-3.5 ${userCoordinates.hasLocation ? 'text-emerald-600' : 'text-primary-600'}`} />
          <span className="hidden sm:inline">GPS</span>
        </button>

        {/* View Location on Google Maps Button */}
        <button
          type="button"
          onClick={() => openInGoogleMaps(userCoordinates.lat, userCoordinates.lng, userCoordinates.label)}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors shrink-0"
          title="Open current location on Google Maps"
        >
          <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden sm:inline">Map ↗</span>
        </button>
      </div>

      {/* Quick Search Suggestions */}
      <div className="flex items-center gap-1.5 pt-2 px-1 text-[11px] text-slate-500 overflow-x-auto no-scrollbar">
        <span className="font-semibold text-slate-400 shrink-0">Quick Search:</span>
        {[
          { label: 'Kota Allen', q: 'Allen' },
          { label: 'MP Nagar Bhopal', q: 'MP Nagar' },
          { label: 'MANIT Hostels', q: 'MANIT' },
          { label: 'Koramangala PG', q: 'Koramangala' },
          { label: 'Kothrud Pune', q: 'Kothrud' },
          { label: 'Girls PG', q: 'Girls' },
          { label: 'Stanza Living', q: 'Stanza' },
          { label: 'Zolo Stays', q: 'Zolo' }
        ].map((chip) => (
          <button
            key={chip.label}
            type="button"
            onClick={() => {
              setQuery(chip.q);
              onSearch(chip.q);
            }}
            className={`px-2 py-0.5 rounded-full shrink-0 border transition-all ${
              query.toLowerCase() === chip.q.toLowerCase()
                ? 'bg-primary-600 text-white border-primary-600 font-bold'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;
