import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, MapPin, Compass, ArrowRight, ShieldCheck, 
  Wallet, Layers, Sparkles, Building2, CheckCircle2 
} from 'lucide-react';
import SearchBar from '../components/SearchBar';
import HostelGrid from '../components/HostelGrid';
import hostelService from '../services/hostelService';
import { useApp } from '../context/AppContext';

const POPULAR_AREAS = [
  { name: 'MP Nagar', city: 'Bhopal', count: '12+ Hostels' },
  { name: 'Indraprastha Area', city: 'Kota', count: '40+ Hostels' },
  { name: 'Koramangala', city: 'Bangalore', count: '24+ Hostels' },
  { name: 'Kothrud', city: 'Pune', count: '18+ Hostels' },
  { name: 'North Campus', city: 'Delhi', count: '30+ Hostels' },
  { name: 'Bhawarkua', city: 'Indore', count: '15+ Hostels' },
  { name: 'Madhapur', city: 'Hyderabad', count: '20+ Hostels' },
  { name: 'Powai', city: 'Mumbai', count: '14+ Hostels' }
];

const Home = () => {
  const [featuredHostels, setFeaturedHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const navigate = useNavigate();
  const { userCoordinates, setIsLocationModalOpen } = useApp();

  useEffect(() => {
    const fetchFeatured = async () => {
      setLoading(true);
      try {
        const data = await hostelService.getAllHostels({
          userLat: userCoordinates.lat,
          userLng: userCoordinates.lng,
          sort: 'nearest'
        });
        setFeaturedHostels(data.slice(0, 6));
      } catch (err) {
        console.warn('Failed to load featured hostels:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, [userCoordinates]);

  const handleSearchSubmit = (searchTerm) => {
    navigate(`/explore?q=${encodeURIComponent(searchTerm || '')}&city=${selectedCity === 'All Cities' ? 'all' : selectedCity}`);
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden rounded-3xl bg-gradient-to-b from-primary-900 via-secondary-900 to-slate-900 text-white px-6 md:px-12 shadow-elevated">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-primary-200 text-xs font-semibold backdrop-blur border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Built for Student Life & Budget Management</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
            Find the Right Hostel Near You
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Discover hostels, compare prices, explore facilities and track your living expenses — all in one place.
          </p>

          {/* Interactive Search Box */}
          <div className="pt-4 max-w-3xl mx-auto">
            <SearchBar
              onSearch={handleSearchSubmit}
              selectedCity={selectedCity}
              onCityChange={(city) => setSelectedCity(city)}
              isNearestActive={false}
              onToggleNearest={() => navigate('/explore?sort=nearest')}
            />
          </div>

          {/* Location & Nearest Quick Banner in Hero */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
            <button
              type="button"
              onClick={() => setIsLocationModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-emerald-300 font-semibold border border-emerald-500/30 transition-all"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Location: <strong>{userCoordinates.label}</strong> (Change ✏️)</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/explore?sort=nearest')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-sm"
            >
              <span>🎯 Show Nearest Hostels</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Popular Search Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-300">
            <span className="font-semibold text-slate-400">Popular Hubs:</span>
            {POPULAR_AREAS.slice(0, 6).map((area) => (
              <button
                key={area.name}
                type="button"
                onClick={() => navigate(`/explore?area=${encodeURIComponent(area.name)}&city=${encodeURIComponent(area.city)}`)}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
              >
                {area.name} ({area.city})
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Areas Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-primary-600 uppercase tracking-wider block mb-1">
              Top Student Locations
            </span>
            <h2 className="text-2xl font-black text-secondary-900 tracking-tight">
              Popular College & Coaching Hubs
            </h2>
          </div>
          <Link
            to="/explore"
            className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 group"
          >
            <span>View All Areas</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {POPULAR_AREAS.map((area) => (
            <button
              key={area.name}
              type="button"
              onClick={() => navigate(`/explore?area=${encodeURIComponent(area.name)}&city=${encodeURIComponent(area.city)}`)}
              className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-primary-300 hover:shadow-card transition-all text-left group"
            >
              <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <MapPin className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-secondary-900 group-hover:text-primary-600 transition-colors">
                {area.name}
              </h4>
              <p className="text-xs text-secondary-500 mt-0.5">{area.city}</p>
              <span className="text-[11px] font-semibold text-primary-600 mt-2 block">
                {area.count}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Hostels Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-primary-600 uppercase tracking-wider block mb-1">
              Curated Accommodations
            </span>
            <h2 className="text-2xl font-black text-secondary-900 tracking-tight">
              Top Rated & Student-Friendly Hostels
            </h2>
          </div>
          <Link
            to="/explore"
            className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 group"
          >
            <span>Explore All Hostels</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <HostelGrid hostels={featuredHostels} loading={loading} />
      </section>

      {/* How It Works Feature Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200/80 shadow-subtle space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">
              Step-by-Step Experience
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-secondary-900 tracking-tight">
              Make Smart Decisions Before Choosing a Hostel
            </h2>
            <p className="text-xs sm:text-sm text-secondary-500">
              No more surprise bills or hidden fees. We simplify the entire student accommodation journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-3 p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="font-bold text-base text-secondary-900">Discover Nearby</h3>
              <p className="text-xs text-secondary-500 leading-relaxed">
                Filter by university, budget, room sharing, AC, food mess, and exact distance radius.
              </p>
            </div>

            <div className="space-y-3 p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="font-bold text-base text-secondary-900">Compare Transparently</h3>
              <p className="text-xs text-secondary-500 leading-relaxed">
                Stack up to 4 hostels side-by-side to review deposits, electricity policies, and curfew rules.
              </p>
            </div>

            <div className="space-y-3 p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="font-bold text-base text-secondary-900">Calculate Living Cost</h3>
              <p className="text-xs text-secondary-500 leading-relaxed">
                Estimate real monthly expenditure combining room rent, mess food, laundry, and daily commute.
              </p>
            </div>

            <div className="space-y-3 p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h3 className="font-bold text-base text-secondary-900">Track All Expenses</h3>
              <p className="text-xs text-secondary-500 leading-relaxed">
                Log every rupee with Recharts visual analytics, monthly budget progress, and smart spending insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-primary-600 to-indigo-700 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-glow">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-black">
              Ready to take control of your student budget?
            </h3>
            <p className="text-primary-100 text-sm max-w-xl">
              Sign up today to save favorite hostels, track recurring rent and mess fees, and receive monthly budget insights.
            </p>
          </div>
          <Link
            to="/register"
            className="px-6 py-3.5 rounded-xl bg-white text-primary-700 font-bold text-sm shadow-md hover:bg-slate-50 transition-all shrink-0 active:scale-95"
          >
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
