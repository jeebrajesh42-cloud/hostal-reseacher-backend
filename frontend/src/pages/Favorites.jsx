import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Compass, ArrowRight } from 'lucide-react';
import HostelGrid from '../components/HostelGrid';
import EmptyState from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import expenseService from '../services/expenseService';
import { useAuth } from '../context/AuthContext';

const Favorites = () => {
  const { isAuthenticated } = useAuth();
  const [favoriteHostels, setFavoriteHostels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const loadFavs = async () => {
      setLoading(true);
      try {
        const data = await expenseService.getFavorites();
        setFavoriteHostels(data.map(f => f.hostel).filter(Boolean));
      } catch (err) {
        console.warn('Error loading favorites:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadFavs();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto my-12 border border-slate-200/80 shadow-subtle space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <Heart className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-secondary-900">Sign in to Save Favorites</h2>
        <p className="text-xs text-secondary-500">
          Create a free account or sign in to bookmark your favorite student hostels.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white font-semibold text-xs"
        >
          <span>Sign In</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Heart className="w-5 h-5 fill-rose-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-secondary-900 tracking-tight">
              My Saved Hostels ({favoriteHostels.length})
            </h1>
            <p className="text-xs text-secondary-500">
              Personal shortlist of accommodations you are interested in visiting.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading saved hostels..." />
      ) : favoriteHostels.length === 0 ? (
        <EmptyState
          icon="favorites"
          title="No favorite hostels saved yet"
          description="Click the heart icon on any hostel card to add it to your personal shortlist."
          actionLabel="Explore Hostels"
          onAction={() => (window.location.href = '/explore')}
        />
      ) : (
        <HostelGrid hostels={favoriteHostels} loading={false} />
      )}
    </div>
  );
};

export default Favorites;
