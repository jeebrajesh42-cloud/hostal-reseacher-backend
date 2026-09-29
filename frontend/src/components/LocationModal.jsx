import React, { useState, useMemo } from 'react';
import { MapPin, Navigation, Search, X, Check, Compass, Sparkles, Building, ExternalLink } from 'lucide-react';
import { useApp, LOCATION_PRESETS } from '../context/AppContext';

const LocationModal = () => {
  const {
    isLocationModalOpen,
    setIsLocationModalOpen,
    userCoordinates,
    setLocationByArea,
    setLocationByCity,
    requestBrowserLocation,
    openInGoogleMaps
  } = useApp();

  const [activeCityTab, setActiveCityTab] = useState(() => {
    return userCoordinates.city || 'Bhopal';
  });
  const [searchQuery, setSearchQuery] = useState('');

  if (!isLocationModalOpen) return null;

  // Filtered list of areas based on search query
  const filteredPresets = useMemo(() => {
    if (!searchQuery.trim()) {
      return LOCATION_PRESETS.filter(c => c.city.toLowerCase() === activeCityTab.toLowerCase());
    }
    const q = searchQuery.toLowerCase().trim();
    return LOCATION_PRESETS.map(cityGroup => {
      const matchCity = cityGroup.city.toLowerCase().includes(q);
      const matchedAreas = cityGroup.areas.filter(
        a =>
          a.name.toLowerCase().includes(q) ||
          a.landmark.toLowerCase().includes(q) ||
          matchCity
      );
      if (matchCity || matchedAreas.length > 0) {
        return {
          ...cityGroup,
          areas: matchCity ? cityGroup.areas : matchedAreas
        };
      }
      return null;
    }).filter(Boolean);
  }, [activeCityTab, searchQuery]);

  const handleSelectArea = (cityName, areaName) => {
    setLocationByArea(cityName, areaName);
    setIsLocationModalOpen(false);
  };

  const handleSelectEntireCity = (cityName) => {
    setLocationByCity(cityName);
    setIsLocationModalOpen(false);
  };

  const handleGPSDetect = () => {
    requestBrowserLocation();
    setIsLocationModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-secondary-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsLocationModalOpen(false)}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] z-10">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-slate-50 via-white to-primary-50/30">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-bold mb-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary-600" />
              <span>Location & Student Hub Selector</span>
            </div>
            <h2 className="text-xl font-black text-secondary-900 tracking-tight">
              Select Your City & Coaching Area
            </h2>
            <p className="text-xs text-secondary-500 mt-0.5">
              Distances to hostels are calculated from your selected study hub or GPS coordinates.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsLocationModalOpen(false)}
            className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close location selector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & GPS Action Bar */}
        <div className="p-5 border-b border-slate-100 space-y-3 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search area, college (e.g. Allen, MANIT, Koramangala, Kothrud)..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-secondary-900 placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 shadow-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleGPSDetect}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 active:scale-95"
            >
              <Navigation className="w-3.5 h-3.5 text-white" />
              <span>Detect My GPS</span>
            </button>
          </div>

          {/* Active Location Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-secondary-600 shadow-sm">
            <div className="flex items-center gap-2 truncate">
              <span className="font-semibold text-secondary-400 shrink-0">Current Location:</span>
              <strong className="text-secondary-900 font-bold truncate">
                📍 {userCoordinates.label}
              </strong>
              {userCoordinates.hasLocation && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                  Active
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => openInGoogleMaps(userCoordinates.lat, userCoordinates.lng, userCoordinates.label)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors shrink-0"
              title="Open current location on Google Maps"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Check on Map ↗</span>
            </button>
          </div>
        </div>

        {/* City Filter Tabs (Only shown when not actively searching) */}
        {!searchQuery && (
          <div className="px-5 pt-3 pb-1 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {LOCATION_PRESETS.map((c) => {
              const isSelected = activeCityTab.toLowerCase() === c.city.toLowerCase();
              return (
                <button
                  key={c.city}
                  type="button"
                  onClick={() => setActiveCityTab(c.city)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-secondary-600'
                  }`}
                >
                  {c.city}
                </button>
              );
            })}
          </div>
        )}

        {/* Areas / Hubs List */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {filteredPresets.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <p className="text-sm font-bold text-secondary-700">No areas found for "{searchQuery}"</p>
              <p className="text-xs text-secondary-400">Try searching another landmark, college, or city name.</p>
            </div>
          ) : (
            filteredPresets.map((cityGroup) => (
              <div key={cityGroup.city} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-primary-600" />
                    <h3 className="font-extrabold text-sm text-secondary-900">
                      {cityGroup.city} Student Hubs
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectEntireCity(cityGroup.city)}
                    className="text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline"
                  >
                    Select All {cityGroup.city}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {cityGroup.areas.map((area) => {
                    const isActive =
                      userCoordinates.city?.toLowerCase() === cityGroup.city.toLowerCase() &&
                      userCoordinates.area?.toLowerCase() === area.name.toLowerCase();

                    return (
                      <button
                        key={area.name}
                        type="button"
                        onClick={() => handleSelectArea(cityGroup.city, area.name)}
                        className={`p-3.5 rounded-2xl border text-left transition-all duration-200 relative group flex flex-col justify-between ${
                          isActive
                            ? 'bg-primary-50/70 border-primary-500 shadow-sm'
                            : 'bg-white border-slate-200/80 hover:border-primary-300 hover:bg-slate-50/80'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className={`text-xs font-bold transition-colors ${isActive ? 'text-primary-800' : 'text-secondary-900 group-hover:text-primary-600'}`}>
                            {area.name}
                          </span>
                          {isActive && (
                            <span className="w-5 h-5 rounded-full bg-primary-600 text-white flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-secondary-500 mt-1 line-clamp-2">
                          {area.landmark}
                        </p>

                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-secondary-400">
                          <span>{cityGroup.city}</span>
                          <div className="flex items-center gap-2.5">
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                openInGoogleMaps(area.lat, area.lng, `${area.name}, ${cityGroup.city}`);
                              }}
                              className="text-blue-600 hover:text-blue-800 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                              title="Preview on Google Maps"
                            >
                              <span>Map</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </span>
                            <span className="text-primary-600 font-semibold group-hover:underline">
                              {isActive ? 'Current Selection' : 'Click to Set'}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-secondary-500">
          <span>Supported: Bhopal, Kota, Bangalore, Pune, Delhi, Indore, Hyderabad, Mumbai</span>
          <button
            type="button"
            onClick={() => setIsLocationModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-secondary-800 font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
