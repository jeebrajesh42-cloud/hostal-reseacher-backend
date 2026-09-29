import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, MapPin, X, Target, Sparkles, Navigation, ExternalLink, Globe } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import HostelGrid from '../components/HostelGrid';
import hostelService from '../services/hostelService';
import { useApp } from '../context/AppContext';

const ExploreHostels = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { userCoordinates, setIsLocationModalOpen, openInGoogleMaps } = useApp();

  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [livePlaces, setLivePlaces] = useState([]);
  const [searchingLive, setSearchingLive] = useState(false);

  // Active filter state initialized from URL params
  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    city: searchParams.get('city') || 'all',
    area: searchParams.get('area') || '',
    minRent: searchParams.get('minRent') || '',
    maxRent: searchParams.get('maxRent') || '25000',
    hostelType: searchParams.get('hostelType') || 'all',
    roomType: searchParams.get('roomType') || 'all',
    amenities: searchParams.get('amenities') || '',
    rating: searchParams.get('rating') || '',
    maxDistance: searchParams.get('maxDistance') || '',
    sort: searchParams.get('sort') || 'highest_rating'
  });

  // Fetch hostels whenever filters or coordinates change
  useEffect(() => {
    const fetchHostels = async () => {
      setLoading(true);
      try {
        const query = {
          ...filters,
          userLat: userCoordinates.lat,
          userLng: userCoordinates.lng
        };
        const data = await hostelService.getAllHostels(query);
        setHostels(data);
      } catch (err) {
        console.warn('Error fetching hostels:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHostels();
  }, [filters, userCoordinates]);

  // Update URL parameters when filters change
  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const updated = { ...prev, [key]: value };
      const newParams = new URLSearchParams();
      Object.entries(updated).forEach(([k, v]) => {
        if (v && v !== 'all') newParams.set(k, v);
      });
      setSearchParams(newParams);
      return updated;
    });
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      q: '',
      city: 'all',
      area: '',
      minRent: '',
      maxRent: '25000',
      hostelType: 'all',
      roomType: 'all',
      amenities: '',
      rating: '',
      maxDistance: '',
      sort: 'highest_rating'
    };
    setFilters(defaultFilters);
    setLivePlaces([]);
    setSearchParams(new URLSearchParams());
  };

  const handleLiveSearch = async () => {
    setSearchingLive(true);
    try {
      const cityToSearch = (filters.city !== 'all' && filters.city) || userCoordinates.city || '';
      const res = await hostelService.liveSearchHostels({
        q: filters.q || 'Hostel',
        city: cityToSearch,
        userLat: userCoordinates.lat,
        userLng: userCoordinates.lng
      });
      if (res && res.livePlaces) {
        setLivePlaces(res.livePlaces);
      }
    } catch (err) {
      console.warn('Live search error:', err.message);
    } finally {
      setSearchingLive(false);
    }
  };

  const isNearestActive = filters.sort === 'nearest';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Search & Filter Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-subtle space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-secondary-900 tracking-tight">
              Explore Student Hostels
            </h1>
            <p className="text-xs text-secondary-500">
              Browse and filter verified student residences near your college or coaching center.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-secondary-700 text-xs font-semibold transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4 text-primary-600" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        <SearchBar
          initialValue={filters.q}
          onSearch={(q) => handleFilterChange('q', q)}
          selectedCity={filters.city === 'all' ? 'All Cities' : filters.city}
          onCityChange={(city) => handleFilterChange('city', city)}
          isNearestActive={isNearestActive}
          onToggleNearest={() => handleFilterChange('sort', isNearestActive ? 'highest_rating' : 'nearest')}
        />
      </div>

      {/* Main Content Layout: Sidebar Filter Left, Grid Right */}
      <div className="flex items-start gap-8">
        <FilterPanel
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
          isMobileOpen={mobileFilterOpen}
          onCloseMobile={() => setMobileFilterOpen(false)}
        />

        <main className="flex-1 min-w-0 space-y-4">
          {/* Active Study Location & Nearest Discovery Banner */}
          <div className="bg-gradient-to-r from-primary-900 via-secondary-900 to-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-3.5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white uppercase tracking-wider">
                  Active Reference Hub
                </span>
                {isNearestActive && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-primary-500 text-white uppercase tracking-wider animate-pulse">
                    🎯 Nearest First Active
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Showing student hostels near: <strong className="text-emerald-300">{userCoordinates.label}</strong></span>
              </h2>
              <p className="text-xs text-slate-300">
                All distances and walking times calculated from this study hub location.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => openInGoogleMaps(userCoordinates.lat, userCoordinates.lng, userCoordinates.label)}
                className="px-3.5 py-2 rounded-xl bg-blue-600/40 hover:bg-blue-600/70 text-blue-100 text-xs font-bold transition-all border border-blue-400/40 flex items-center gap-1.5"
                title="Open active location on Google Maps"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View on Map ↗</span>
              </button>

              <button
                type="button"
                onClick={() => setIsLocationModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 flex items-center gap-1.5"
                title="Change active student hub or city"
              >
                <span>Change Location</span>
                <span>✏️</span>
              </button>

              <button
                type="button"
                onClick={() => handleFilterChange('sort', isNearestActive ? 'highest_rating' : 'nearest')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isNearestActive
                    ? 'bg-emerald-500 text-white shadow-md ring-2 ring-emerald-400/50'
                    : 'bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40'
                }`}
                title="Sort closest hostels first"
              >
                <span>🎯 {isNearestActive ? 'Nearest Active ✓' : 'Show Nearest First'}</span>
              </button>
            </div>
          </div>

          {/* Live Google Maps Query Assistant for Search Terms */}
          {filters.q && (
            <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-3.5 sm:p-4 rounded-2xl border border-blue-800 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-blue-400 shrink-0" />
                <div>
                  <span className="text-[11px] text-blue-200">Looking for a specific student place or PG?</span>
                  <h4 className="text-xs sm:text-sm font-bold text-white">Search "{filters.q}" on Google Maps Live Directory</h4>
                </div>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(filters.q)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shrink-0 shadow-sm"
              >
                <span>Open on Google Maps ↗</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Results Summary Bar with Distance Pills & Live Web Search Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-secondary-600 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-subtle">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-semibold">
                Showing <strong className="text-secondary-900">{hostels.length}</strong> verified hostels
              </span>

              <button
                type="button"
                onClick={handleLiveSearch}
                disabled={searchingLive}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 transition-colors shadow-sm disabled:opacity-50"
                title="Search real places in this city via OpenStreetMap live directory"
              >
                <Globe className={`w-3.5 h-3.5 text-blue-600 ${searchingLive ? 'animate-spin' : ''}`} />
                <span>{searchingLive ? 'Searching Real Map...' : 'Search Real Places on Live Map 🌐'}</span>
              </button>
            </div>

            {/* Quick Distance Radius Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-[11px] text-secondary-400 font-medium hidden md:inline">Radius:</span>
              {[
                { id: '', label: 'All' },
                { id: '2', label: '< 2 km' },
                { id: '5', label: '< 5 km' },
                { id: '10', label: '< 10 km' }
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => handleFilterChange('maxDistance', pill.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    (filters.maxDistance || '') === pill.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-secondary-700'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Filter Chips */}
          {(filters.city !== 'all' || filters.hostelType !== 'all' || filters.roomType !== 'all' || filters.q || filters.maxDistance || isNearestActive) && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-secondary-400 font-medium">Active Filters:</span>
              {isNearestActive && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold">
                  🎯 Sorted: Nearest to {userCoordinates.label}
                  <button onClick={() => handleFilterChange('sort', 'highest_rating')}>
                    <X className="w-3 h-3 hover:text-emerald-950" />
                  </button>
                </span>
              )}
              {filters.city !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 font-semibold">
                  City: {filters.city}
                  <button onClick={() => handleFilterChange('city', 'all')}>
                    <X className="w-3 h-3 hover:text-primary-900" />
                  </button>
                </span>
              )}
              {filters.maxDistance && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold">
                  Within: {filters.maxDistance} km
                  <button onClick={() => handleFilterChange('maxDistance', '')}>
                    <X className="w-3 h-3 hover:text-emerald-900" />
                  </button>
                </span>
              )}
              {filters.hostelType !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 font-semibold capitalize">
                  Type: {filters.hostelType}
                  <button onClick={() => handleFilterChange('hostelType', 'all')}>
                    <X className="w-3 h-3 hover:text-primary-900" />
                  </button>
                </span>
              )}
              {filters.q && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold">
                  Query: "{filters.q}"
                  <button onClick={() => handleFilterChange('q', '')}>
                    <X className="w-3 h-3 hover:text-slate-900" />
                  </button>
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold text-primary-600 hover:underline ml-2"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Live OpenStreetMap Search Results Section */}
          {livePlaces.length > 0 && (
            <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-card space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-600 text-white">
                    🌐 OpenStreetMap Live Directory
                  </span>
                  <h3 className="text-sm font-bold text-slate-100">
                    {livePlaces.length} Real Establishments Found in Real World
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setLivePlaces([])}
                  className="text-xs text-slate-400 hover:text-white underline self-start sm:self-auto"
                >
                  Dismiss Live Places
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {livePlaces.map((place) => (
                  <div key={place.id} className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700/60 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                        <span className="text-emerald-400 font-bold">📍 Real Place</span>
                        {place.distanceKm && (
                          <span className="font-bold text-slate-200">{place.distanceKm} km away</span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-white mb-1">{place.name}</h4>
                      <p className="text-xs text-slate-300 line-clamp-2 mb-3">{place.address}</p>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-700">
                      <a
                        href={place.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs text-center flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span>Open on Google Maps ↗</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hostels Grid */}
          <HostelGrid
            hostels={hostels}
            loading={loading}
            onResetFilters={handleResetFilters}
            searchQuery={filters.q}
            onLiveSearch={handleLiveSearch}
            searchingLive={searchingLive}
          />
        </main>
      </div>
    </div>
  );
};

export default ExploreHostels;
