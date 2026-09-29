import React from 'react';
import { Link } from 'react-router-dom';
import { X, Check, Minus, Plus, ExternalLink, ArrowRight } from 'lucide-react';
import Rating from './Rating';
import { useApp } from '../context/AppContext';

const HostelComparison = () => {
  const { comparedHostels, removeFromComparison, clearComparison } = useApp();

  if (comparedHostels.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center max-w-xl mx-auto my-8 shadow-subtle">
        <h3 className="text-lg font-bold text-secondary-900 mb-2">No hostels selected for comparison</h3>
        <p className="text-secondary-500 text-sm mb-6">
          Browse hostels and click the "Compare" button on any card to view a side-by-side breakdown of costs, amenities, and room options.
        </p>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm transition-all shadow-sm"
        >
          <span>Explore Hostels</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  // Calculate estimated total for each hostel
  const calculateTotal = (h) => {
    const rent = parseFloat(h.monthly_rent || 0);
    const food = h.food_included ? 0 : parseFloat(h.food_charge || 0);
    const elec = parseFloat(h.electricity_charge || 0);
    const maint = parseFloat(h.maintenance_charge || 0);
    const transport = 800;
    const laundry = 400;
    return rent + food + elec + maint + transport + laundry;
  };

  const featureCheck = (hostel, featureKeywords) => {
    if (!hostel.amenities) return false;
    const am = hostel.amenities.map(a => a.toLowerCase());
    return featureKeywords.some(keyword => am.some(a => a.includes(keyword.toLowerCase())));
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-secondary-900">
            Hostel Comparison ({comparedHostels.length} / 4)
          </h2>
          <p className="text-xs text-secondary-500">
            Factual side-by-side comparison matrix to help you choose the best hostel.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {comparedHostels.length < 4 && (
            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary-50 text-primary-700 hover:bg-primary-100 font-semibold text-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Another</span>
            </Link>
          )}
          <button
            type="button"
            onClick={clearComparison}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Comparison Grid Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="p-4 text-xs font-bold text-secondary-500 uppercase tracking-wider w-1/4">
                Feature / Metric
              </th>
              {comparedHostels.map((h) => (
                <th key={h.id} className="p-4 align-top w-1/4">
                  <div className="relative group">
                    <button
                      onClick={() => removeFromComparison(h.id)}
                      className="absolute -top-2 -right-2 p-1 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove from comparison"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="aspect-[16/10] rounded-xl overflow-hidden mb-2.5 bg-slate-100">
                      <img
                        src={h.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=500&q=80'}
                        alt={h.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Link
                      to={`/hostels/${h.id}`}
                      className="font-bold text-sm text-secondary-900 hover:text-primary-600 line-clamp-1 block transition-colors mb-1"
                    >
                      {h.name}
                    </Link>
                    <p className="text-xs text-secondary-500 mb-2">{h.area}, {h.city}</p>
                    <Rating rating={h.rating} reviewCount={h.review_count} size="sm" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {/* Monthly Rent */}
            <tr className="hover:bg-slate-50/50">
              <td className="p-4 font-bold text-secondary-700">Monthly Rent</td>
              {comparedHostels.map((h) => (
                <td key={h.id} className="p-4 font-extrabold text-base text-secondary-900">
                  ₹{h.monthly_rent?.toLocaleString('en-IN')}
                </td>
              ))}
            </tr>

            {/* Estimated Total Monthly Living Cost */}
            <tr className="bg-primary-50/40 hover:bg-primary-50/70 font-semibold">
              <td className="p-4 text-primary-900 font-bold">
                Total Est. Living Cost
                <span className="block font-normal text-[11px] text-primary-700">
                  (Rent + Food + Utilities + Commute)
                </span>
              </td>
              {comparedHostels.map((h) => (
                <td key={h.id} className="p-4 font-black text-primary-700 text-base">
                  ₹{calculateTotal(h).toLocaleString('en-IN')}/mo
                </td>
              ))}
            </tr>

            {/* Security Deposit */}
            <tr className="hover:bg-slate-50/50">
              <td className="p-4 font-semibold text-secondary-700">Security Deposit</td>
              {comparedHostels.map((h) => (
                <td key={h.id} className="p-4 text-secondary-800">
                  ₹{h.security_deposit?.toLocaleString('en-IN')} (Refundable)
                </td>
              ))}
            </tr>

            {/* Food Cost / Mess */}
            <tr className="hover:bg-slate-50/50">
              <td className="p-4 font-semibold text-secondary-700">Food / Mess Plan</td>
              {comparedHostels.map((h) => (
                <td key={h.id} className="p-4 text-secondary-800">
                  {h.food_included ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Included in Rent
                    </span>
                  ) : (
                    <span>+₹{h.food_charge?.toLocaleString('en-IN')}/month</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Distance from Location */}
            <tr className="hover:bg-slate-50/50">
              <td className="p-4 font-semibold text-secondary-700">Distance</td>
              {comparedHostels.map((h) => (
                <td key={h.id} className="p-4 text-secondary-800">
                  {h.distanceKm !== null && h.distanceKm !== undefined ? `${h.distanceKm} km away` : 'Selected City Center'}
                </td>
              ))}
            </tr>

            {/* Room Type */}
            <tr className="hover:bg-slate-50/50">
              <td className="p-4 font-semibold text-secondary-700">Room Options</td>
              {comparedHostels.map((h) => (
                <td key={h.id} className="p-4 text-secondary-800">
                  {h.room_types?.map(r => r.room_type.replace('_', ' ')).join(', ') || 'Single, Double'}
                </td>
              ))}
            </tr>

            {/* High-speed Wi-Fi */}
            <tr className="hover:bg-slate-50/50">
              <td className="p-4 font-semibold text-secondary-700">High-speed Wi-Fi</td>
              {comparedHostels.map((h) => {
                const has = featureCheck(h, ['wi-fi', 'wifi', 'internet']);
                return (
                  <td key={h.id} className="p-4">
                    {has ? <Check className="w-4 h-4 text-emerald-600" /> : <Minus className="w-4 h-4 text-slate-300" />}
                  </td>
                );
              })}
            </tr>

            {/* AC */}
            <tr className="hover:bg-slate-50/50">
              <td className="p-4 font-semibold text-secondary-700">Air Conditioning (AC)</td>
              {comparedHostels.map((h) => {
                const has = featureCheck(h, ['ac', 'air conditioning']);
                return (
                  <td key={h.id} className="p-4">
                    {has ? <Check className="w-4 h-4 text-emerald-600" /> : <Minus className="w-4 h-4 text-slate-300" />}
                  </td>
                );
              })}
            </tr>

            {/* Automated Laundry */}
            <tr className="hover:bg-slate-50/50">
              <td className="p-4 font-semibold text-secondary-700">Laundry Facility</td>
              {comparedHostels.map((h) => {
                const has = featureCheck(h, ['laundry', 'washing']);
                return (
                  <td key={h.id} className="p-4">
                    {has ? <Check className="w-4 h-4 text-emerald-600" /> : <Minus className="w-4 h-4 text-slate-300" />}
                  </td>
                );
              })}
            </tr>

            {/* 24/7 Security */}
            <tr className="hover:bg-slate-50/50">
              <td className="p-4 font-semibold text-secondary-700">Biometric & CCTV Security</td>
              {comparedHostels.map((h) => {
                const has = featureCheck(h, ['cctv', 'biometric', 'security']);
                return (
                  <td key={h.id} className="p-4">
                    {has ? <Check className="w-4 h-4 text-emerald-600" /> : <Minus className="w-4 h-4 text-slate-300" />}
                  </td>
                );
              })}
            </tr>

            {/* Silent Study Room */}
            <tr className="hover:bg-slate-50/50">
              <td className="p-4 font-semibold text-secondary-700">Study Room / Library</td>
              {comparedHostels.map((h) => {
                const has = featureCheck(h, ['study', 'library']);
                return (
                  <td key={h.id} className="p-4">
                    {has ? <Check className="w-4 h-4 text-emerald-600" /> : <Minus className="w-4 h-4 text-slate-300" />}
                  </td>
                );
              })}
            </tr>

            {/* Action Row */}
            <tr>
              <td className="p-4 font-semibold text-secondary-700">Actions</td>
              {comparedHostels.map((h) => (
                <td key={h.id} className="p-4">
                  <Link
                    to={`/hostels/${h.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs transition-colors"
                  >
                    <span>View Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HostelComparison;
