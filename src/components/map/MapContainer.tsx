import { useState, useCallback } from 'react';
import { MapComponent } from './MapComponent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Navigation, MapPin } from 'lucide-react';

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface MapContainerProps {
  onLocationSelect?: (location: Location) => void;
  selectedLocation?: Location;
  height?: string;
  showSearch?: boolean;
}

export function MapContainer({ 
  onLocationSelect, 
  selectedLocation,
  height = '400px',
  showSearch = true 
}: MapContainerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [userLocation, setUserLocation] = useState<Location | null>(null);

  // Get user's current location
  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          onLocationSelect?.(location);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, [onLocationSelect]);

  // Search for locations (mock implementation)
  const searchLocation = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      // Mock search results - replace with actual geocoding API
      const mockResults: Location[] = [
        { lat: 28.6139, lng: 77.2090, address: 'New Delhi, Delhi' },
        { lat: 19.0760, lng: 72.8777, address: 'Mumbai, Maharashtra' },
        { lat: 12.9716, lng: 77.5946, address: 'Bangalore, Karnataka' },
        { lat: 17.3850, lng: 78.4867, address: 'Hyderabad, Telangana' },
      ].filter(loc => 
        loc.address?.toLowerCase().includes(query.toLowerCase())
      );

      setSearchResults(mockResults);
    } catch (error) {
      console.error('Search error:', error);
    }
  }, []);

  const markers = [
    ...(userLocation ? [{ ...userLocation, icon: '/user-location.png', position: [userLocation.lat, userLocation.lng] as [number, number] }] : []),
    ...(selectedLocation ? [{ ...selectedLocation, position: [selectedLocation.lat, selectedLocation.lng] as [number, number] }] : []),
    ...searchResults.map(result => ({ ...result, position: [result.lat, result.lng] as [number, number] }))
  ];

  return (
    <div className="space-y-4">
      {showSearch && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Location Search</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search for a location..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    searchLocation(e.target.value);
                  }}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={getCurrentLocation}
                variant="outline"
                size="icon"
              >
                <Navigation className="w-4 h-4" />
              </Button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 rounded-lg border hover:bg-gray-50 cursor-pointer"
                    onClick={() => onLocationSelect?.(result)}
                  >
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{result.address}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <MapComponent
            center={selectedLocation ? [selectedLocation.lat, selectedLocation.lng] as [number, number] : (userLocation ? [userLocation.lat, userLocation.lng] as [number, number] : [28.6139, 77.2090])}
            markers={markers}
            height={height}
            onLocationSelect={(lat, lng) => {
              const location = { lat, lng };
              onLocationSelect?.(location);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
