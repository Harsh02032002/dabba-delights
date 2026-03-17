import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface OrderTrackingMapProps {
  order: any;
  deliveryLocation?: { lat: number; lng: number };
}

const OrderTrackingMap = ({ order, deliveryLocation }: OrderTrackingMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapRef.current || !order) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([
      deliveryLocation?.lat || order.sellerId?.address?.location?.coordinates?.[1] || 30.735613,
      deliveryLocation?.lng || order.sellerId?.address?.location?.coordinates?.[0] || 76.745934
    ], 13);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Create custom icons
    const restaurantIcon = L.divIcon({
      html: '<div style="background: #3B82F6; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">🏪</div>',
      iconSize: [30, 30],
      className: 'custom-div-icon'
    });

    const customerIcon = L.divIcon({
      html: '<div style="background: #10B981; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">🏠</div>',
      iconSize: [30, 30],
      className: 'custom-div-icon'
    });

    const deliveryIcon = L.divIcon({
      html: '<div style="background: #F97316; color: white; border-radius: 50%; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; font-size: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">🛵</div>',
      iconSize: [25, 25],
      className: 'custom-div-icon'
    });

    // Add markers
    const restaurantCoords: [number, number] = [
      order.sellerId?.address?.location?.coordinates?.[1] || 30.735613,
      order.sellerId?.address?.location?.coordinates?.[0] || 76.745934
    ];

    const customerCoords: [number, number] = [
      order.deliveryAddress?.location?.coordinates?.[1] || 30.735700,
      order.deliveryAddress?.location?.coordinates?.[0] || 76.746000
    ];

    const restaurantMarker = L.marker(restaurantCoords, { icon: restaurantIcon })
      .addTo(map)
      .bindPopup(`<b>🏪 ${order.sellerId?.businessName || 'Restaurant'}</b><br>Pickup Location`);

    const customerMarker = L.marker(customerCoords, { icon: customerIcon })
      .addTo(map)
      .bindPopup(`<b>🏠 Your Location</b><br>Delivery Address`);

    // Add delivery partner marker if order is out for delivery
    let deliveryMarker: L.Marker | null = null;
    if (order.status === 'out_for_delivery' && deliveryLocation) {
      deliveryMarker = L.marker([deliveryLocation.lat, deliveryLocation.lng], { icon: deliveryIcon })
        .addTo(map)
        .bindPopup('<b>🛵 Delivery Partner</b><br>Current Position');
    }

    // Draw route line
    const routeCoordinates: [number, number][] = [
      restaurantCoords,
      customerCoords
    ];

    L.polyline(routeCoordinates, {
      color: '#3B82F6',
      weight: 3,
      opacity: 0.7,
      dashArray: '10, 10'
    }).addTo(map);

    // Fit map to show all markers
    const group = new L.FeatureGroup([restaurantMarker, customerMarker]);
    if (deliveryMarker) {
      group.addLayer(deliveryMarker);
    }
    map.fitBounds(group.getBounds().pad(0.1));

    mapInstanceRef.current = map;
    setMapLoaded(true);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [order, deliveryLocation]);

  // Update delivery partner position
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !deliveryLocation) return;

    // Find and update delivery partner marker
    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        const popup = layer.getPopup();
        if (popup && popup.getContent().toString().includes('Delivery Partner')) {
          layer.setLatLng([deliveryLocation.lat, deliveryLocation.lng]);
        }
      }
    });
  }, [deliveryLocation, mapLoaded]);

  return (
    <div className="relative">
      <div ref={mapRef} className="w-full h-64 rounded-xl overflow-hidden shadow-lg" />
      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-medium shadow">
        📍 {order.status === 'out_for_delivery' ? 'Order on the way!' : 'Preparing your order'}
      </div>
      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-medium shadow">
        🚮 Order #{order.orderNumber?.slice(-8).toUpperCase()}
      </div>
    </div>
  );
};

export default OrderTrackingMap;
