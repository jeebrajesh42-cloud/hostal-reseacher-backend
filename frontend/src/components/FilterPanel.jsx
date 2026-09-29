import React from 'react';
import { SlidersHorizontal, RotateCcw, X, Shield, Star, DollarSign, Users, Home, MapPin, Target } from 'lucide-react';

const FACILITIES_LIST = [
  'High-speed Wi-Fi',
  'Air Conditioning (AC)',
  '3 Meals + Evening Snacks',
  'Automated Laundry',
  'Two-wheeler / Car Parking',
  '24/7 Power Backup (DG)',
  'CCTV & Biometric Security',
  'Silent Study Room & Library',
  'Fitness Gym',
  'Daily Housekeeping'
];

const CITIES = ['all', 'Bhopal', 'Kota', 'Bangalore', 'Pune', 'Delhi', 'Indore', 'Hyderabad', 'Mumbai'];

const FilterPanel = ({
  filters,
  onChange,
  onReset,
  isMobileOpen = false,
  onCloseMobile = null
}) => {
  const handleFacilityToggle = (facility) => {
    const current = filters.amenities ? filters.amenities.split(',').filter(Boolean) : [];
    let updated;
    if (current.includes(facility)) {
      updated = current.filter(f => f !== facility);
    } else {
      updated = [...current, facility];
    }
    onChange('amenities', updated.join(','));
  };

  const content = (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 text-secondary-900 font-bold">
          <SlidersHorizontal className="w-4 h-4 text-primary-600" />
          <span>Filters</span>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset All</span>
        </button>
      </div>

      {/* Sorting */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-secondary-700 uppercase tracking-wider block">
          Sort By
        </label>
        <select
          value={filters.sort || 'highest_rating'}
          onChange={(e) => onChange('sort', e.target.value)}
          className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-secondary-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          <option value="nearest">📍 Nearest (Closest First)</option>
          <option value="highest_rating">★ Highest Rated</option>
          <option value="lowest_price">₹ Lowest Price (Rent)</option>
          <option value="price_desc">₹ Highest Price (Rent)</option>
          <option value="popular">🔥 Most Popular</option>
          <option value="recent">🕒 Recently Added</option>
        </select>
      </div>

      {/* Distance Radius Filter */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-secondary-700 uppercase tracking-wider block">
            Distance Radius
          </label>
          <Target className="w-3 h-3 text-emerald-600" />
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: '', label: 'Any Distance' },
            { id: '2', label: '< 2 km (Walking)' },
            { id: '5', label: '< 5 km' },
            { id: '10', label: '< 10 km' }
          ].map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => onChange('maxDistance', d.id)}
              className={`py-1.5 px-2 text-xs font-semibold rounded-xl transition-all ${
                (filters.maxDistance || '') === d.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-secondary-700 border border-slate-200/60'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* City Filter */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-secondary-700 uppercase tracking-wider block">
          City
        </label>
        <select
          value={filters.city || 'all'}
          onChange={(e) => onChange('city', e.target.value)}
          className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-secondary-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c === 'all' ? 'All Cities' : c}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <label className="font-bold text-secondary-700 uppercase tracking-wider">
            Monthly Rent
          </label>
          <span className="font-bold text-primary-600">
            Up to ₹{parseInt(filters.maxRent || 25000, 10).toLocaleString('en-IN')}
          </span>
        </div>
        <input
          type="range"
          min="4000"
          max="25000"
          step="500"
          value={filters.maxRent || 25000}
          onChange={(e) => onChange('maxRent', e.target.value)}
          className="w-full accent-primary-600 cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-secondary-400">
          <span>₹4,000</span>
          <span>₹15,000</span>
          <span>₹25,000+</span>
        </div>
      </div>

      {/* Hostel Gender Type */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-secondary-700 uppercase tracking-wider block">
          Hostel Type
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {['all', 'boys', 'girls', 'co-ed'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onChange('hostelType', type)}
              className={`py-2 px-1 text-xs font-semibold rounded-xl capitalize transition-all ${
                (filters.hostelType || 'all') === type
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-secondary-700 border border-slate-200/60'
              }`}
            >
              {type === 'all' ? 'All' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Room Sharing Type */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-secondary-700 uppercase tracking-wider block">
          Room Sharing
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: 'all', label: 'Any Room' },
            { id: 'single', label: 'Single Room' },
            { id: 'double', label: 'Double Sharing' },
            { id: 'triple', label: 'Triple Sharing' }
          ].map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => onChange('roomType', r.id)}
              className={`py-2 px-2 text-xs font-semibold rounded-xl text-left transition-all ${
                (filters.roomType || 'all') === r.id
                  ? 'bg-primary-50 text-primary-700 border border-primary-300'
                  : 'bg-slate-50 hover:bg-slate-100 text-secondary-700 border border-slate-200/60'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Minimum Rating */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-secondary-700 uppercase tracking-wider block">
          Minimum Rating
        </label>
        <div className="flex gap-1.5">
          {[
            { val: '', label: 'All' },
            { val: '4.0', label: '4.0+ ★' },
            { val: '4.5', label: '4.5+ ★' }
          ].map((r) => (
            <button
              key={r.label}
              type="button"
              onClick={() => onChange('rating', r.val)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                (filters.rating || '') === r.val
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-secondary-700 border border-slate-200/60'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Facilities & Amenities */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-secondary-700 uppercase tracking-wider block">
          Key Facilities
        </label>
        <div className="space-y-2">
          {FACILITIES_LIST.map((facility) => {
            const currentSelected = filters.amenities ? filters.amenities.split(',').includes(facility) : false;
            return (
              <label
                key={facility}
                className="flex items-center gap-2.5 text-xs text-secondary-700 cursor-pointer hover:text-secondary-900 select-none"
              >
                <input
                  type="checkbox"
                  checked={currentSelected}
                  onChange={() => handleFacilityToggle(facility)}
                  className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 w-4 h-4 cursor-pointer"
                />
                <span>{facility}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle sticky top-24">
          {content}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-secondary-900/50 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full p-6 shadow-2xl overflow-y-auto">
            <button
              onClick={onCloseMobile}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="pt-2">{content}</div>
          </div>
        </div>
      )}
    </>
  );
};

export default FilterPanel;
