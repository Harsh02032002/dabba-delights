// Add this to your rider hub console for debugging

// 1. Check current location state
console.log('📍 Current Location State:', currentLocation);

// 2. Get location from backend API
fetch('http://localhost:5000/api/delivery/profile', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(response => response.json())
.then(data => {
  console.log('📍 Backend Profile Data:', data);
  if (data.partner && data.partner.currentLocation) {
    const coords = data.partner.currentLocation.coordinates;
    console.log('📍 Backend Coordinates:', coords);
    console.log('📍 Formatted Location:', {
      lat: coords[1],
      lng: coords[0],
      formatted: `${coords[1].toFixed(6)}, ${coords[0].toFixed(6)}`
    });
  }
})
.catch(error => console.error('❌ Error fetching profile:', error));

// 3. Manual location detection
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      console.log('📍 GPS Location:', { latitude, longitude });
      console.log('📍 GPS Formatted:', `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
    },
    (error) => {
      console.error('❌ GPS Error:', error);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
}

// 4. Check browser location
console.log('📍 Browser Location API:', navigator.geolocation ? 'Available' : 'Not Available');

// 5. Check token
console.log('📍 Auth Token:', localStorage.getItem('token') ? 'Present' : 'Missing');

// 6. Check API base URL
console.log('📍 API URL:', import.meta.env.VITE_API_URL || 'http://localhost:5000/api');

console.log('🔍 Rider Hub Debug Complete!');
