import React, { useState } from 'react';
import { 
  MapPin, Phone, Mail, User, ShieldCheck, Clock, Utensils, 
  Wifi, Heart, Layers, Check, Calculator, Building, Bus, 
  ShoppingBag, Cross, Coffee, Award, Send, ExternalLink, Navigation
} from 'lucide-react';
import ImageGallery from './ImageGallery';
import Rating from './Rating';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import hostelService from '../services/hostelService';

const HostelDetails = ({ hostel, onReviewAdded }) => {
  const {
    isFavorite,
    toggleFavorite,
    isComparing,
    addToComparison,
    removeFromComparison,
    showToast,
    openInGoogleMaps,
    openDirectionsInGoogleMaps,
    userCoordinates
  } = useApp();
  const { isAuthenticated } = useAuth();

  const isFav = isFavorite(hostel.id);
  const comparing = isComparing(hostel.id);

  // Interactive Living Cost Calculator state
  const [costAssumptions, setCostAssumptions] = useState({
    monthly_rent: hostel.monthly_rent || 0,
    food_charge: hostel.food_included ? 0 : (hostel.food_charge || 2200),
    electricity_charge: hostel.electricity_charge || 500,
    internet_charge: hostel.internet_charge || 0,
    maintenance_charge: hostel.maintenance_charge || 300,
    laundry: 400,
    transportation: 800,
    other: 500
  });

  // Review Form State
  const [userRating, setUserRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Calculate live total cost
  const calculatedTotal = Object.values(costAssumptions).reduce((sum, val) => sum + parseFloat(val || 0), 0);

  const handleCostChange = (key, value) => {
    const num = Math.max(0, parseFloat(value) || 0);
    setCostAssumptions(prev => ({ ...prev, [key]: num }));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please sign in to leave a review.', 'warning');
      return;
    }
    if (!reviewComment.trim() || reviewComment.trim().length < 5) {
      showToast('Review comment must be at least 5 characters.', 'warning');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await hostelService.addReview(hostel.id, {
        rating: userRating,
        review_text: reviewComment.trim()
      });
      showToast('Review submitted successfully!', 'success');
      setReviewComment('');
      if (onReviewAdded) onReviewAdded(res);
    } catch (err) {
      showToast(err.message || 'Failed to submit review.', 'danger');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-subtle">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white flex items-center gap-1 shadow-sm">
                ✓ Verified Establishment
              </span>
              {hostel.source_url && (
                <a
                  href={hostel.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1.5 transition-colors shadow-sm"
                  title="View original place profile on Google Maps / Official Portal"
                >
                  <span>Source: {hostel.source_name || 'Official Listing'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-primary-100 text-primary-800 capitalize">
                {hostel.hostel_type} Accommodation
              </span>
              {hostel.availability && (
                <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Rooms Available
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-secondary-900 tracking-tight">
              {hostel.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-secondary-600">
              <Rating rating={hostel.rating} reviewCount={hostel.review_count} size="md" />

              <button
                type="button"
                onClick={() => openInGoogleMaps(hostel.latitude, hostel.longitude, `${hostel.name}, ${hostel.address || hostel.area}, ${hostel.city}`)}
                className="flex items-center gap-1.5 text-secondary-700 hover:text-primary-600 font-semibold hover:underline text-left cursor-pointer transition-colors"
                title="Click to check this hostel on Google Maps"
              >
                <MapPin className="w-4 h-4 text-primary-600 shrink-0" />
                <span>{hostel.address}, {hostel.area}, {hostel.city} - {hostel.pincode}</span>
                <ExternalLink className="w-3.5 h-3.5 text-primary-500 opacity-80 shrink-0" />
              </button>

              {hostel.distanceKm !== null && hostel.distanceKm !== undefined && (
                <button
                  type="button"
                  onClick={() => openDirectionsInGoogleMaps(hostel.latitude, hostel.longitude, hostel.name)}
                  className="px-3 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center gap-1 transition-colors"
                  title="Click to get directions on Google Maps"
                >
                  <Navigation className="w-3 h-3 text-emerald-600" />
                  <span>{hostel.distanceKm} km away (Directions ↗)</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Actions (Favorite, Compare, Inquire) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleFavorite(hostel)}
              className={`p-3 rounded-2xl flex items-center gap-2 font-semibold text-sm transition-all active:scale-95 ${
                isFav
                  ? 'bg-rose-50 text-rose-600 border border-rose-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-600' : ''}`} />
              <span className="hidden sm:inline">{isFav ? 'Saved' : 'Favorite'}</span>
            </button>

            <button
              onClick={() => (comparing ? removeFromComparison(hostel.id) : addToComparison(hostel))}
              className={`p-3 rounded-2xl flex items-center gap-2 font-semibold text-sm transition-all active:scale-95 ${
                comparing
                  ? 'bg-secondary-900 text-white shadow-md'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">{comparing ? 'In Comparison' : 'Compare'}</span>
            </button>
          </div>
        </div>

        {/* Image Gallery Stage */}
        <div className="pt-6">
          <ImageGallery images={hostel.images || []} hostelName={hostel.name} />
        </div>
      </div>

      {/* Main Grid: Details Left, Cost Calculator Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section: Overview */}
          <section className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-subtle space-y-4">
            <h2 className="text-lg font-bold text-secondary-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-primary-600" />
              <span>Hostel Overview</span>
            </h2>
            <p className="text-secondary-600 text-sm leading-relaxed whitespace-pre-line">
              {hostel.description}
            </p>

            {/* Quick Specs Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-xs text-secondary-500 font-medium block">Starting Rent</span>
                <span className="text-base font-extrabold text-secondary-900">₹{hostel.monthly_rent?.toLocaleString('en-IN')}/mo</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-xs text-secondary-500 font-medium block">Security Deposit</span>
                <span className="text-base font-extrabold text-secondary-900">₹{hostel.security_deposit?.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-xs text-secondary-500 font-medium block">Food Mess</span>
                <span className="text-base font-extrabold text-secondary-900">
                  {hostel.food_included ? 'Included' : `₹${hostel.food_charge}/mo`}
                </span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-xs text-secondary-500 font-medium block">Admission Fee</span>
                <span className="text-base font-extrabold text-secondary-900">₹{hostel.admission_fee || 0}</span>
              </div>
            </div>
          </section>

          {/* Section: Room Types */}
          <section className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-subtle space-y-4">
            <h2 className="text-lg font-bold text-secondary-900">Available Room Types</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(hostel.room_types || []).map((room) => (
                <div
                  key={room.id || room.room_type}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-sm text-secondary-900 capitalize">
                      {room.room_type.replace('_', ' ')}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-emerald-100 text-emerald-800">
                      {room.available_rooms} Left
                    </span>
                  </div>
                  <div className="text-xl font-extrabold text-primary-600 mb-1">
                    ₹{room.price?.toLocaleString('en-IN')}<span className="text-xs text-secondary-500 font-normal">/month</span>
                  </div>
                  <p className="text-xs text-secondary-500">
                    Maximum Capacity: {room.capacity} Student{room.capacity > 1 ? 's' : ''}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Section: Amenities */}
          <section className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-subtle space-y-4">
            <h2 className="text-lg font-bold text-secondary-900">Facilities & Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(hostel.amenities || []).map((amenity, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-secondary-800"
                >
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Section: Food & Mess Information */}
          <section className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-subtle space-y-3">
            <h2 className="text-lg font-bold text-secondary-900 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-emerald-600" />
              <span>Food & Mess Information</span>
            </h2>
            <p className="text-secondary-600 text-sm leading-relaxed">
              {hostel.food_included
                ? 'Hygienic breakfast, lunch, evening tea with snacks, and dinner are included directly in the monthly rent. Both North Indian and South Indian choices are rotated weekly.'
                : `Mess facility is optional and available for an additional charge of ₹${hostel.food_charge?.toLocaleString('en-IN')} per month. Pure RO drinking water is provided free of cost 24/7.`}
            </p>
          </section>

          {/* Section: Rules & Guidelines */}
          <section className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-subtle space-y-3">
            <h2 className="text-lg font-bold text-secondary-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <span>Hostel Rules & Curfew</span>
            </h2>
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 text-xs text-amber-950 leading-relaxed">
              {hostel.rules || 'Entry deadline 10:30 PM. No loud music post 11:00 PM. Visitors allowed in lounge only until 8 PM.'}
            </div>
          </section>

          {/* Section: Nearby Places */}
          <section className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-subtle space-y-4">
            <h2 className="text-lg font-bold text-secondary-900">Nearby Essentials & Transport</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <Building className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-secondary-900 block">Colleges / Institutes</span>
                  <span className="text-secondary-600">{hostel.nearby_college || 'Main University (1.5 km)'}</span>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <Bus className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-secondary-900 block">Transport Links</span>
                  <span className="text-secondary-600">{hostel.nearby_transport || 'Metro & City Bus Stop (400m)'}</span>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <ShoppingBag className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-secondary-900 block">Supermarket & Grocery</span>
                  <span className="text-secondary-600">{hostel.nearby_grocery || 'Local Mart (200m)'}</span>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <Cross className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-secondary-900 block">Hospitals & Clinics</span>
                  <span className="text-secondary-600">{hostel.nearby_hospital || 'City Hospital (1.2 km)'}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Interactive Map & Live Navigation */}
          <section className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-subtle space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-secondary-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary-600" />
                  <span>Hostel Location & Interactive Map</span>
                </h2>
                <p className="text-xs text-secondary-500 mt-0.5">
                  {hostel.address}, {hostel.area}, {hostel.city} - {hostel.pincode}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => openDirectionsInGoogleMaps(hostel.latitude, hostel.longitude, hostel.name)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                  title="Open GPS route in Google Maps"
                >
                  <Navigation className="w-3.5 h-3.5 text-white" />
                  <span>Get Directions ↗</span>
                </button>

                <button
                  type="button"
                  onClick={() => openInGoogleMaps(hostel.latitude, hostel.longitude, `${hostel.name}, ${hostel.address || hostel.area}, ${hostel.city}`)}
                  className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1.5 border border-blue-200 transition-colors"
                  title="Open this hostel in Google Maps"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                  <span>Google Maps ↗</span>
                </button>
              </div>
            </div>

            {/* Embedded OpenStreetMap Live View */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100 h-80">
              <iframe
                title={`${hostel.name} Location Map`}
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(hostel.longitude) - 0.012}%2C${parseFloat(hostel.latitude) - 0.008}%2C${parseFloat(hostel.longitude) + 0.012}%2C${parseFloat(hostel.latitude) + 0.008}&layer=mapnik&marker=${hostel.latitude}%2C${hostel.longitude}`}
                className="w-full h-full"
              />
              <div className="absolute bottom-2.5 right-2.5 z-10 bg-white/95 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-200 text-[11px] font-semibold text-secondary-700 shadow-sm flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary-600" />
                <span>GPS: {hostel.latitude}, {hostel.longitude}</span>
              </div>
            </div>
          </section>

          {/* Section: Reviews & Feedback */}
          <section className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-subtle space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-secondary-900">
                Student Reviews ({hostel.reviews?.length || 0})
              </h2>
              <Rating rating={hostel.rating} size="sm" />
            </div>

            {/* Submit Review Form */}
            <form onSubmit={handleReviewSubmit} className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4">
              <h3 className="text-sm font-bold text-secondary-900">Leave a Review</h3>
              <div>
                <label className="text-xs text-secondary-600 block mb-1.5 font-medium">Select Rating</label>
                <Rating
                  rating={userRating}
                  interactive={true}
                  onRatingChange={(r) => setUserRating(r)}
                  size="md"
                />
              </div>
              <div>
                <label className="text-xs text-secondary-600 block mb-1.5 font-medium">Review Comment</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details regarding food, Wi-Fi speed, warden behavior, or cleanliness..."
                  rows="3"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 bg-white"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submittingReview}
                className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submittingReview ? 'Posting...' : 'Post Review'}</span>
              </button>
            </form>

            {/* Reviews List */}
            <div className="space-y-4">
              {(hostel.reviews && hostel.reviews.length > 0) ? (
                hostel.reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-subtle space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-secondary-900">{rev.user_name || 'Student Resident'}</span>
                      <span className="text-secondary-400">
                        {new Date(rev.created_at).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <Rating rating={rev.rating} size="sm" />
                    <p className="text-xs text-secondary-600 leading-relaxed pt-1">
                      {rev.review_text}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-secondary-500 italic">No reviews posted yet. Be the first to review!</p>
              )}
            </div>
          </section>
        </div>

        {/* Right Sticky Column: Interactive Living Cost Calculator & Contact */}
        <div className="space-y-6 lg:sticky lg:top-24">
          {/* Estimated Monthly Living Cost Calculator (Section 12) */}
          <div className="bg-gradient-to-b from-white to-slate-50/80 rounded-3xl p-6 border-2 border-primary-100 shadow-elevated space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Calculator className="w-5 h-5 text-primary-600" />
              <div>
                <h3 className="font-bold text-sm text-secondary-900">Estimated Living Cost</h3>
                <p className="text-[11px] text-secondary-500">Customize assumptions for your budget</p>
              </div>
            </div>

            {/* Total Highlight */}
            <div className="bg-primary-600 text-white rounded-2xl p-4 shadow-sm">
              <span className="text-xs font-medium text-primary-100 block">Total Estimated Monthly Cost</span>
              <div className="text-2xl font-black mt-0.5">
                ₹{Math.round(calculatedTotal).toLocaleString('en-IN')}
                <span className="text-xs font-normal text-primary-200"> / month</span>
              </div>
            </div>

            {/* Cost Sliders / Inputs */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-secondary-600 font-medium">Monthly Rent</span>
                <span className="font-bold text-secondary-900">₹{costAssumptions.monthly_rent}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-secondary-600 font-medium">Food / Mess</span>
                <div className="flex items-center gap-1">
                  <span>₹</span>
                  <input
                    type="number"
                    value={costAssumptions.food_charge}
                    onChange={(e) => handleCostChange('food_charge', e.target.value)}
                    className="w-20 px-2 py-1 text-right rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-secondary-600 font-medium">Electricity Share</span>
                <div className="flex items-center gap-1">
                  <span>₹</span>
                  <input
                    type="number"
                    value={costAssumptions.electricity_charge}
                    onChange={(e) => handleCostChange('electricity_charge', e.target.value)}
                    className="w-20 px-2 py-1 text-right rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-secondary-600 font-medium">Laundry & Cleaning</span>
                <div className="flex items-center gap-1">
                  <span>₹</span>
                  <input
                    type="number"
                    value={costAssumptions.laundry}
                    onChange={(e) => handleCostChange('laundry', e.target.value)}
                    className="w-20 px-2 py-1 text-right rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-secondary-600 font-medium">College Commute</span>
                <div className="flex items-center gap-1">
                  <span>₹</span>
                  <input
                    type="number"
                    value={costAssumptions.transportation}
                    onChange={(e) => handleCostChange('transportation', e.target.value)}
                    className="w-20 px-2 py-1 text-right rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-secondary-600 font-medium">Other Miscellaneous</span>
                <div className="flex items-center gap-1">
                  <span>₹</span>
                  <input
                    type="number"
                    value={costAssumptions.other}
                    onChange={(e) => handleCostChange('other', e.target.value)}
                    className="w-20 px-2 py-1 text-right rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <p className="text-[11px] text-secondary-400 italic text-center">
              Estimates include recurring monthly living expenditures.
            </p>
          </div>

          {/* Contact & Inquiries */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-subtle space-y-4">
            <h3 className="font-bold text-sm text-secondary-900">Hostel Contact & Booking</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2.5 text-secondary-700">
                <User className="w-4 h-4 text-primary-600 shrink-0" />
                <span>Manager: <strong>{hostel.owner_name || 'Hostel Warden'}</strong></span>
              </div>
              <div className="flex items-center gap-2.5 text-secondary-700">
                <Phone className="w-4 h-4 text-primary-600 shrink-0" />
                <span>{hostel.contact_phone || '+91 98260 11223'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-secondary-700 truncate">
                <Mail className="w-4 h-4 text-primary-600 shrink-0" />
                <span className="truncate">{hostel.contact_email || 'warden@hostel.com'}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <a
                href={`tel:${hostel.contact_phone || '+919826011223'}`}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-secondary-900 hover:bg-secondary-800 text-white font-semibold text-xs transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Manager for Visit</span>
              </a>

              {hostel.source_url && (
                <a
                  href={hostel.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View Source Listing ↗</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostelDetails;
