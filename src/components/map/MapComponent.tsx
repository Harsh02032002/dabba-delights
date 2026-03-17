import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapComponentProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    position: [number, number];
    popup?: string;
    icon?: string;
  }>;
  height?: string;
  onLocationSelect?: (lat: number, lng: number) => void;
}

export function MapComponent({ 
  center = [28.6139, 77.2090], 
  zoom = 13,
  markers = [],
  height = '400px',
  onLocationSelect
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView(center, zoom);
    mapInstanceRef.current = map;

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add markers
    markers.forEach(marker => {
      const icon = L.icon({
        iconUrl: marker.icon || '/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      const leafletMarker = L.marker(marker.position, { icon })
        .addTo(map);
      
      if (marker.popup) {
        leafletMarker.bindPopup(marker.popup);
      }
    });

    // Handle location clicks
    if (onLocationSelect) {
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        onLocationSelect(lat, lng);
      });
    }

    return () => {
      map.remove();
    };
  }, [center, zoom, markers, onLocationSelect]);

  return <div ref={mapRef} style={{ height, width: '100%' }} />;
}
