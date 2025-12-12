import React, { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

const ArtisanMap = ({ artisans, center, zoom = 12, onMarkerClick }) => {
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const markersRef = useRef([]);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey) {
      console.warn('Google Maps API key not configured');
      return;
    }

    // Load Google Maps script
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    } else {
      setMapLoaded(true);
    }
  }, [apiKey]);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.google || !center) return;

    // Initialize map
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: center.latitude, lng: center.longitude },
      zoom: zoom,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
    });

    setMapInstance(map);

    // Add user location marker
    new window.google.maps.Marker({
      position: { lat: center.latitude, lng: center.longitude },
      map: map,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#3B82F6',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 2,
      },
      title: 'Your Location',
    });

    return () => {
      // Cleanup markers
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
    };
  }, [mapLoaded, center, zoom]);

  useEffect(() => {
    if (!mapInstance || !artisans || artisans.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Add artisan markers
    artisans.forEach((artisan) => {
      if (!artisan.latitude || !artisan.longitude) return;

      const marker = new window.google.maps.Marker({
        position: { lat: parseFloat(artisan.latitude), lng: parseFloat(artisan.longitude) },
        map: mapInstance,
        title: `${artisan.first_name} ${artisan.last_name}`,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
              <path fill="#16a34a" d="M16 0C7.2 0 0 7.2 0 16c0 8.8 16 24 16 24s16-15.2 16-24C32 7.2 24.8 0 16 0z"/>
              <circle cx="16" cy="16" r="6" fill="white"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 40),
        },
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">
              ${artisan.first_name} ${artisan.last_name}
            </h3>
            <p style="margin: 0 0 4px 0; color: #666; font-size: 14px;">
              ${artisan.skills?.slice(0, 2).join(', ') || 'Artisan'}
            </p>
            ${artisan.distance_km ? `<p style="margin: 0; color: #16a34a; font-size: 12px;">📍 ${artisan.distance_km.toFixed(1)} km away</p>` : ''}
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstance, marker);
        if (onMarkerClick) {
          onMarkerClick(artisan);
        }
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (artisans.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend({ lat: center.latitude, lng: center.longitude });
      artisans.forEach((artisan) => {
        if (artisan.latitude && artisan.longitude) {
          bounds.extend({ lat: parseFloat(artisan.latitude), lng: parseFloat(artisan.longitude) });
        }
      });
      mapInstance.fitBounds(bounds);
    }
  }, [mapInstance, artisans, center, onMarkerClick]);

  if (!apiKey) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">Map view unavailable</p>
          <p className="text-sm text-gray-500">Google Maps API key not configured</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

export default ArtisanMap;
