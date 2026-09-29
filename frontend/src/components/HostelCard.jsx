import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Wifi, Wind, Utensils, ArrowRight, Check, Layers, GraduationCap, ExternalLink } from 'lucide-react';
import Rating from './Rating';
import { useApp } from '../context/AppContext';

const HostelCard = ({ hostel }) => {
  const {
    isFavorite,
    toggleFavorite,
    isComparing,
    addToComparison,
    removeFromComparison,
    openInGoogleMaps,
    openDirectionsInGoogleMaps
  } = useApp();

  const isFav = isFavorite(hostel.id);
  const comparing = isComparing(hostel.id);

  // Derive badges cleanly
  const isBudget = hostel.monthly_rent <= 7500;
  const isPremium = hostel.monthly_rent >= 12000;
  const isHighlyRated = hostel.rating >= 4.6;
  const hasWifi = hostel.amenities?.some(a => a.toLowerCase().includes('wi-fi')) || true;
  const hasAC = hostel.amenities?.some(a => a.toLowerCase().includes('ac') || a.toLowerCase().includes('air condition'));

  // Format primary room
  const primaryRoom = hostel.room_types?.[0]?.room_type || 'Double Sharing';
  const formattedRoom = primaryRoom.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

  const coverImage = hostel.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80';

  const hasDistance = hostel.distanceKm !== null && hostel.distanceKm !== undefined;
  const isWalkingDist = hasDistance && hostel.distanceKm <= 0.8;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card transition-all duration-300 flex flex-col overflow-hidden group">
      {/* Cover Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={coverImage}
          alt={hostel.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Tags */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/95 text-white tracking-wide shadow-sm">
            Verified
          </span>
          {isBudget && (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-600 text-white shadow-sm">
              Budget
            </span>
          )}
          {isPremium && (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-600 text-white shadow-sm">
              Premium
            </span>
          )}
          {isHighlyRated && (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-600 text-white shadow-sm">
              ★ Highly Rated
            </span>
          )}
        </div>

        {/* Favorite Action Overlay */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          <button
            type="button"
            onClick={() => toggleFavorite(hostel)}
            className={`p-2 rounded-xl backdrop-blur transition-all active:scale-90 ${
              isFav
                ? 'bg-rose-500 text-white shadow-md'
                : 'bg-white/80 hover:bg-white text-slate-700 shadow-sm'
            }`}
            title={isFav ? 'Remove from favorites' : 'Save to favorites'}
            aria-label="Toggle favorite"
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Hostel Gender / Type Badge */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900/80 text-white backdrop-blur capitalize">
            {hostel.hostel_type} Hostel
          </span>
        </div>

        {/* Prominent Distance Badge on Cover (Clickable to Map Directions) */}
        {hasDistance && (
          <div className="absolute bottom-3 right-3 z-10">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openDirectionsInGoogleMaps(hostel.latitude, hostel.longitude, hostel.name);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-extrabold backdrop-blur shadow-sm flex items-center gap-1 cursor-pointer transition-transform hover:scale-105 active:scale-95 ${
                isWalkingDist
                  ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-300'
                  : hostel.distanceKm <= 2.5
                  ? 'bg-emerald-950/85 text-emerald-300'
                  : 'bg-slate-900/80 text-white'
              }`}
              title="Click to open route & directions on Google Maps"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {isWalkingDist
                  ? `${(hostel.distanceKm * 1000).toFixed(0)}m (Walking Dist)`
                  : `${hostel.distanceKm} km away`}
              </span>
              <ExternalLink className="w-2.5 h-2.5 opacity-80" />
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating, Verified Source Link & Location Area/City */}
          <div className="flex items-center justify-between text-xs text-secondary-500 mb-2 gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Rating rating={hostel.rating} reviewCount={hostel.review_count} size="sm" />
              {hostel.source_url && (
                <a
                  href={hostel.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200 transition-colors"
                  title={`Source: ${hostel.source_name || 'Verified Listing'}. Click to view original place listing.`}
                >
                  <span>✓ {hostel.source_name?.split(' ')[0] || 'Verified'}</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openInGoogleMaps(hostel.latitude, hostel.longitude, `${hostel.name}, ${hostel.address || hostel.area}, ${hostel.city}`);
              }}
              className="flex items-center gap-1 text-slate-700 hover:text-primary-600 font-semibold truncate hover:underline cursor-pointer"
              title="Click to check hostel on Google Maps"
            >
              <MapPin className="w-3.5 h-3.5 text-primary-600 shrink-0" />
              <span className="truncate">{hostel.area}, {hostel.city}</span>
              <ExternalLink className="w-2.5 h-2.5 text-primary-500 shrink-0 opacity-70" />
            </button>
          </div>

          {/* Hostel Name */}
          <Link
            to={`/hostels/${hostel.id}`}
            className="block text-base font-bold text-secondary-900 group-hover:text-primary-600 transition-colors line-clamp-1 mb-1.5"
          >
            {hostel.name}
          </Link>

          {/* Nearby College or Landmark Indicator */}
          {hostel.nearby_college && (
            <div className="text-[11px] text-slate-500 font-medium truncate mb-2.5 flex items-center gap-1">
              <GraduationCap className="w-3 h-3 text-secondary-400 shrink-0" />
              <span className="truncate text-secondary-600">{hostel.nearby_college.split(',')[0]}</span>
            </div>
          )}

          {/* Pricing Highlight */}
          <div className="flex items-baseline justify-between mb-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-secondary-900">
                ₹{hostel.monthly_rent?.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-secondary-500 font-medium">/ month</span>
            </div>

            {hasDistance && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                📍 {hostel.distanceKm} km away
              </span>
            )}
          </div>

          {/* Key Specs Pill Matrix */}
          <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 text-xs text-secondary-600 py-2.5 border-t border-b border-slate-100 mb-4">
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-semibold text-secondary-700">Room:</span>
              <span className="truncate">{formattedRoom}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Utensils className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="truncate">Food: {hostel.food_included ? 'Included' : `+₹${hostel.food_charge}`}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3 h-3 text-blue-600 shrink-0" />
              <span>Wi-Fi: {hasWifi ? 'Available' : 'No'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Wind className="w-3 h-3 text-sky-600 shrink-0" />
              <span>AC: {hasAC ? 'Available' : 'Non-AC'}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-2 pt-1">
          <Link
            to={`/hostels/${hostel.id}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-700 font-semibold text-xs transition-colors"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={() => openInGoogleMaps(hostel.latitude, hostel.longitude, `${hostel.name}, ${hostel.address || hostel.area}, ${hostel.city}`)}
            className="px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
            title="Open hostel location in Google Maps"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
            <span>Map</span>
          </button>

          <button
            type="button"
            onClick={() => (comparing ? removeFromComparison(hostel.id) : addToComparison(hostel))}
            className={`px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              comparing
                ? 'bg-secondary-900 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-secondary-700'
            }`}
            title="Compare with other hostels"
          >
            {comparing ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Added</span>
              </>
            ) : (
              <>
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <span>Compare</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HostelCard;
