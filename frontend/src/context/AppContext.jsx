import React, { createContext, useContext, useState, useEffect } from 'react';
import expenseService from '../services/expenseService';
import { useAuth } from './AuthContext';

export const LOCATION_PRESETS = [
  {
    city: 'Bhopal',
    lat: 23.2332,
    lng: 77.4343,
    areas: [
      { name: 'MP Nagar (Zone 1 & 2)', lat: 23.2332, lng: 77.4343, landmark: 'MANIT, Coaching Hub & DB City Mall' },
      { name: 'Indrapuri (Sector A-C)', lat: 23.2505, lng: 77.4650, landmark: 'LNCT, BSSS & BHEL Jubilee Gate' },
      { name: 'Near MANIT (Link Road 3)', lat: 23.2160, lng: 77.4080, landmark: 'MANIT Engineering Gate 1' },
      { name: 'Shivaji Nagar', lat: 23.2270, lng: 77.4190, landmark: 'Nutan Girls College & Campion' }
    ]
  },
  {
    city: 'Kota',
    lat: 25.1325,
    lng: 75.8340,
    areas: [
      { name: 'Indraprastha Area', lat: 25.1325, lng: 75.8340, landmark: 'Allen CP Tower, Resonance, Road No. 1' },
      { name: 'Rajiv Gandhi Nagar', lat: 25.1480, lng: 75.8550, landmark: 'Behind Allen Samarth & Motion' },
      { name: 'Jawahar Nagar', lat: 25.1558, lng: 75.8450, landmark: 'Vibrant Academy & City Mall' },
      { name: 'Landmark City (Kunhari)', lat: 25.2138, lng: 75.8315, landmark: 'Allen Sangyan & Samyak' }
    ]
  },
  {
    city: 'Bangalore',
    lat: 12.9352,
    lng: 77.6245,
    areas: [
      { name: 'Koramangala (4th/5th/7th Block)', lat: 12.9352, lng: 77.6245, landmark: 'Christ University & Sony Signal' },
      { name: 'HSR Layout (Sector 1-4)', lat: 12.9121, lng: 77.6446, landmark: 'NIFT Bangalore & BDA Complex' },
      { name: 'Electronic City', lat: 12.8452, lng: 77.6602, landmark: 'IIIT Bangalore, Wipro & Infosys' },
      { name: 'Indiranagar', lat: 12.9784, lng: 77.6408, landmark: '100ft Road & Metro Station' }
    ]
  },
  {
    city: 'Pune',
    lat: 18.5074,
    lng: 73.8077,
    areas: [
      { name: 'Kothrud (MIT Campus / Paud Rd)', lat: 18.5074, lng: 73.8077, landmark: 'MIT World Peace University' },
      { name: 'Viman Nagar', lat: 18.5679, lng: 73.9143, landmark: 'Symbiosis International & Phoenix Mall' },
      { name: 'Shivajinagar / FC Road', lat: 18.5308, lng: 73.8475, landmark: 'COEP Engineering & Fergusson' },
      { name: 'Hinjewadi Phase 1', lat: 18.5913, lng: 73.7389, landmark: 'Rajiv Gandhi Infotech Park' }
    ]
  },
  {
    city: 'Delhi',
    lat: 28.6920,
    lng: 77.2100,
    areas: [
      { name: 'North Campus (Kamla Nagar)', lat: 28.6920, lng: 77.2100, landmark: 'DU, Hansraj, Hindu & St. Stephens' },
      { name: 'South Campus (Satya Niketan)', lat: 28.5855, lng: 77.1633, landmark: 'Sri Venkateswara & ARSD College' },
      { name: 'Mukherjee Nagar', lat: 28.7088, lng: 77.2166, landmark: 'UPSC & Civil Services Coaching Hub' },
      { name: 'Laxmi Nagar', lat: 28.6304, lng: 77.2773, landmark: 'CA / CS Institute & Metro' }
    ]
  },
  {
    city: 'Indore',
    lat: 22.6926,
    lng: 75.8676,
    areas: [
      { name: 'Bhawarkua', lat: 22.6926, lng: 75.8676, landmark: 'Bholaram Ustad Marg, DAVV & Holkar' },
      { name: 'Vijay Nagar (Scheme 54)', lat: 22.7533, lng: 75.8937, landmark: 'Prestige Institute & C21 Mall' },
      { name: 'Geeta Bhawan / Palasia', lat: 22.7200, lng: 75.8820, landmark: 'GDC & Coaching Center Line' }
    ]
  },
  {
    city: 'Hyderabad',
    lat: 17.4483,
    lng: 78.3915,
    areas: [
      { name: 'Madhapur / HITEC City', lat: 17.4483, lng: 78.3915, landmark: 'NIFT Hyderabad & Cyber Towers' },
      { name: 'Ameerpet', lat: 17.4375, lng: 78.4482, landmark: 'Software & GATE Training Hub' },
      { name: 'Gachibowli', lat: 17.4401, lng: 78.3489, landmark: 'IIIT Hyderabad & University of Hyderabad' }
    ]
  },
  {
    city: 'Mumbai',
    lat: 19.1257,
    lng: 72.9150,
    areas: [
      { name: 'Powai (Near IIT Bombay)', lat: 19.1257, lng: 72.9150, landmark: 'IIT Bombay Main Gate & Hiranandani' },
      { name: 'Vile Parle West', lat: 19.1030, lng: 72.8397, landmark: 'NMIMS, Mithibai & DJ Sanghvi' },
      { name: 'Navi Mumbai (Kharghar)', lat: 19.0473, lng: 73.0699, landmark: 'NIFT, Bharati Vidyapeeth' }
    ]
  }
];

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // 1. Comparison State (up to 4 hostels)
  const [comparedHostels, setComparedHostels] = useState(() => {
    try {
      const saved = localStorage.getItem('comparedHostels');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 2. Favorites state (IDs and objects)
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [favoriteHostels, setFavoriteHostels] = useState([]);

  // 3. User Geolocation / Location State
  const [userCoordinates, setUserCoordinates] = useState(() => {
    try {
      const saved = localStorage.getItem('userCoordinates');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse saved userCoordinates:', e);
    }
    // Default to MP Nagar, Bhopal
    return {
      lat: 23.2332,
      lng: 77.4343,
      hasLocation: true,
      label: 'MP Nagar, Bhopal',
      city: 'Bhopal',
      area: 'MP Nagar (Zone 1 & 2)'
    };
  });

  // 4. Location Selector Modal State
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // 5. Toast notifications
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Sync comparison to localStorage
  useEffect(() => {
    localStorage.setItem('comparedHostels', JSON.stringify(comparedHostels));
  }, [comparedHostels]);

  // Sync userCoordinates to localStorage
  useEffect(() => {
    if (userCoordinates) {
      localStorage.setItem('userCoordinates', JSON.stringify(userCoordinates));
    }
  }, [userCoordinates]);

  // Load user favorites on auth change
  useEffect(() => {
    if (isAuthenticated) {
      expenseService.getFavorites()
        .then(favs => {
          setFavoriteHostels(favs.map(f => f.hostel).filter(Boolean));
          setFavoriteIds(new Set(favs.map(f => f.hostel?.id).filter(Boolean)));
        })
        .catch(err => console.warn('Could not load favorites:', err.message));
    } else {
      setFavoriteIds(new Set());
      setFavoriteHostels([]);
    }
  }, [isAuthenticated]);

  // Comparison helpers
  const addToComparison = (hostel) => {
    if (comparedHostels.some(h => h.id === hostel.id)) {
      showToast(`${hostel.name} is already in your comparison list.`, 'warning');
      return;
    }
    if (comparedHostels.length >= 4) {
      showToast('You can compare up to 4 hostels at a time.', 'warning');
      return;
    }
    setComparedHostels(prev => [...prev, hostel]);
    showToast(`Added ${hostel.name} to comparison.`, 'success');
  };

  const removeFromComparison = (hostelId) => {
    setComparedHostels(prev => prev.filter(h => h.id !== hostelId));
    showToast('Removed hostel from comparison.', 'info');
  };

  const clearComparison = () => {
    setComparedHostels([]);
    showToast('Comparison cleared.', 'info');
  };

  // Favorites helpers
  const toggleFavorite = async (hostel) => {
    if (!isAuthenticated) {
      showToast('Please log in to save favorite hostels.', 'warning');
      return false;
    }

    const isFav = favoriteIds.has(hostel.id);
    try {
      if (isFav) {
        await expenseService.removeFavorite(hostel.id);
        setFavoriteIds(prev => {
          const next = new Set(prev);
          next.delete(hostel.id);
          return next;
        });
        setFavoriteHostels(prev => prev.filter(h => h.id !== hostel.id));
        showToast('Removed from favorites.', 'info');
        return false;
      } else {
        await expenseService.addFavorite(hostel.id);
        setFavoriteIds(prev => new Set(prev).add(hostel.id));
        setFavoriteHostels(prev => [hostel, ...prev]);
        showToast('Saved to your favorite hostels!', 'success');
        return true;
      }
    } catch (err) {
      showToast(err.message || 'Failed to update favorites.', 'danger');
      return isFav;
    }
  };

  // Location selector helpers
  const setLocationByArea = (cityName, areaName) => {
    const cityData = LOCATION_PRESETS.find(c => c.city.toLowerCase() === cityName.toLowerCase());
    if (!cityData) return;

    const areaData = cityData.areas.find(a => a.name.toLowerCase() === areaName.toLowerCase());
    const lat = areaData ? areaData.lat : cityData.lat;
    const lng = areaData ? areaData.lng : cityData.lng;

    const newLoc = {
      lat,
      lng,
      hasLocation: true,
      label: `${areaName}, ${cityData.city}`,
      city: cityData.city,
      area: areaName
    };
    setUserCoordinates(newLoc);
    showToast(`📍 Location set to ${areaName}, ${cityData.city}! Nearby hostels recalculated.`, 'success');
  };

  const setLocationByCity = (cityName) => {
    if (!cityName || cityName.toLowerCase() === 'all') {
      return;
    }
    const cityData = LOCATION_PRESETS.find(c => c.city.toLowerCase() === cityName.toLowerCase());
    if (cityData) {
      const primaryArea = cityData.areas[0];
      const newLoc = {
        lat: primaryArea ? primaryArea.lat : cityData.lat,
        lng: primaryArea ? primaryArea.lng : cityData.lng,
        hasLocation: true,
        label: `${cityData.city} (Central Hub)`,
        city: cityData.city,
        area: primaryArea ? primaryArea.name : ''
      };
      setUserCoordinates(newLoc);
      showToast(`📍 Location switched to ${cityData.city}!`, 'info');
    }
  };

  const matchNearestPresetCity = (lat, lng) => {
    let closest = null;
    let minDistance = Infinity;

    LOCATION_PRESETS.forEach(c => {
      const dLat = (c.lat - lat) * 111;
      const dLng = (c.lng - lng) * 111 * Math.cos(lat * (Math.PI / 180));
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);
      if (dist < minDistance) {
        minDistance = dist;
        closest = c;
      }
    });

    return { closestCity: closest, distanceKm: minDistance };
  };

  // Browser Geolocation trigger with robust IP fallback
  const requestBrowserLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.', 'warning');
      setIsLocationModalOpen(true);
      return;
    }

    showToast('Detecting your GPS location...', 'info');

    const handleSuccess = (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const { closestCity, distanceKm } = matchNearestPresetCity(lat, lng);

      let label = 'My Device Location';
      let city = 'all';
      let area = '';

      if (closestCity && distanceKm < 50) {
        label = `${closestCity.city} (Live GPS)`;
        city = closestCity.city;
        area = closestCity.areas[0]?.name || '';
      } else if (closestCity) {
        label = `GPS (${lat.toFixed(2)}, ${lng.toFixed(2)})`;
        city = closestCity.city;
      }

      const newLoc = {
        lat,
        lng,
        hasLocation: true,
        label,
        city,
        area
      };
      setUserCoordinates(newLoc);
      showToast(`📍 GPS Location updated: ${label}! Nearest hostels refreshed.`, 'success');
    };

    const handleError = (err) => {
      console.warn('Geolocation error:', err.message);
      // Fallback: try network IP location so user is never left without location
      fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
          if (data && data.latitude && data.longitude) {
            const lat = data.latitude;
            const lng = data.longitude;
            const { closestCity } = matchNearestPresetCity(lat, lng);
            const cityName = data.city || closestCity?.city || 'Bhopal';
            const newLoc = {
              lat,
              lng,
              hasLocation: true,
              label: `${cityName} (Network Location)`,
              city: closestCity?.city || cityName,
              area: data.city || ''
            };
            setUserCoordinates(newLoc);
            showToast(`📍 Location detected: ${newLoc.label}`, 'success');
          } else {
            throw new Error('IP unavailable');
          }
        })
        .catch(() => {
          showToast('GPS permission not granted. Please choose your student area from the location menu.', 'warning');
          setIsLocationModalOpen(true);
        });
    };

    // Use enableHighAccuracy: false and timeout: 10000 for fast Wi-Fi resolution on laptops
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      timeout: 10000,
      enableHighAccuracy: false,
      maximumAge: 60000
    });
  };

  const setManualLocation = (label, lat, lng) => {
    setUserCoordinates({
      lat,
      lng,
      hasLocation: true,
      label,
      city: '',
      area: ''
    });
    showToast(`Location set to ${label}.`, 'info');
  };

  // Google Maps opener helpers
  const openInGoogleMaps = (lat, lng, label = '') => {
    const targetLat = lat || userCoordinates.lat;
    const targetLng = lng || userCoordinates.lng;
    const q = label ? encodeURIComponent(`${label}, ${targetLat},${targetLng}`) : `${targetLat},${targetLng}`;
    window.open(`https://maps.google.com/?q=${q}`, '_blank', 'noopener,noreferrer');
  };

  const openDirectionsInGoogleMaps = (destLat, destLng, destName = '') => {
    const origin = `${userCoordinates.lat},${userCoordinates.lng}`;
    const destination = `${destLat},${destLng}`;
    window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <AppContext.Provider
      value={{
        comparedHostels,
        addToComparison,
        removeFromComparison,
        clearComparison,
        isComparing: (hostelId) => comparedHostels.some(h => h.id === hostelId),
        favoriteIds,
        favoriteHostels,
        toggleFavorite,
        isFavorite: (hostelId) => favoriteIds.has(hostelId),
        userCoordinates,
        isLocationModalOpen,
        setIsLocationModalOpen,
        setLocationByArea,
        setLocationByCity,
        requestBrowserLocation,
        setManualLocation,
        openInGoogleMaps,
        openDirectionsInGoogleMaps,
        showToast,
        toast,
        LOCATION_PRESETS
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
