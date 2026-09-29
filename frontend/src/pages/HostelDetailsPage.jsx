import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import HostelDetails from '../components/HostelDetails';
import { LoadingSpinner } from '../components/LoadingSpinner';
import hostelService from '../services/hostelService';
import { useApp } from '../context/AppContext';

const HostelDetailsPage = () => {
  const { id } = useParams();
  const { userCoordinates } = useApp();
  const [hostel, setHostel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await hostelService.getHostelById(id, userCoordinates.lat, userCoordinates.lng);
      setHostel(data);
    } catch (err) {
      setError(err.message || 'Hostel details could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id, userCoordinates]);

  if (loading) {
    return <LoadingSpinner text="Loading hostel details & reviews..." size="lg" />;
  }

  if (error || !hostel) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center max-w-lg mx-auto my-12 border border-slate-200/80 shadow-subtle space-y-4">
        <h2 className="text-xl font-bold text-secondary-900">Hostel Not Found</h2>
        <p className="text-xs text-secondary-500">
          The requested hostel could not be found or has been removed.
        </p>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore Hostels</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Back Link */}
      <Link
        to="/explore"
        className="inline-flex items-center gap-2 text-xs font-semibold text-secondary-600 hover:text-primary-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Hostels</span>
      </Link>

      <HostelDetails hostel={hostel} onReviewAdded={() => fetchDetails()} />
    </div>
  );
};

export default HostelDetailsPage;
