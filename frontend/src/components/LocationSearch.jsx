import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Search, Loader, Navigation } from 'lucide-react';
import { getUserLocation } from '../utils/geolocation';
import toast from 'react-hot-toast';

const LocationSearch = ({ onLocationSelect, placeholder = 'Search location...' }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const inputRef = useRef(null);
  const autocompleteService = useRef(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
    }
  }, []);

  const handleSearch = async (value) => {
    setQuery(value);

    if (!value || value.length < 3) {
      setSuggestions([]);
      return;
    }

    if (!apiKey || !autocompleteService.current) {
      return;
    }

    setLoading(true);

    try {
      autocompleteService.current.getPlacePredictions(
        {
          input: value,
          componentRestrictions: { country: 'ng' }, // Restrict to Nigeria
        },
        (predictions, status) => {
          setLoading(false);
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions);
          } else {
            setSuggestions([]);
          }
        }
      );
    } catch (error) {
      setLoading(false);
      console.error('Autocomplete error:', error);
    }
  };

  const handleSelectSuggestion = async (placeId, description) => {
    setQuery(description);
    setSuggestions([]);

    if (!window.google) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ placeId }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        onLocationSelect({
          latitude: location.lat(),
          longitude: location.lng(),
          address: description,
        });
      }
    });
  };

  const handleGetCurrentLocation = async () => {
    setGettingLocation(true);
    try {
      const location = await getUserLocation();
      onLocationSelect({
        latitude: location.latitude,
        longitude: location.longitude,
        address: 'Current Location',
      });
      setQuery('Current Location');
      toast.success('Location detected');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setGettingLocation(false);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <button
          onClick={handleGetCurrentLocation}
          disabled={gettingLocation}
          className="absolute right-2 top-2 p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50"
          title="Use my current location"
        >
          {gettingLocation ? (
            <Loader className="h-5 w-5 animate-spin" />
          ) : (
            <Navigation className="h-5 w-5" />
          )}
        </button>
      </div>

      {loading && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center z-10">
          <Loader className="h-5 w-5 animate-spin mx-auto text-primary-600" />
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto z-10">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.place_id}
              onClick={() => handleSelectSuggestion(suggestion.place_id, suggestion.description)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start gap-3 border-b border-gray-100 last:border-b-0"
            >
              <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">{suggestion.structured_formatting.main_text}</p>
                <p className="text-xs text-gray-500">{suggestion.structured_formatting.secondary_text}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
