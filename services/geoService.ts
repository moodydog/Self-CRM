import { Coordinates, Customer } from '../types';

// Haversine formula to calculate distance in kilometers
export const calculateDistance = (coord1: Coordinates, coord2: Coordinates): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(coord2.lat - coord1.lat);
  const dLon = deg2rad(coord2.lng - coord1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(coord1.lat)) * Math.cos(deg2rad(coord2.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
};

// Use OpenStreetMap Nominatim for reverse geocoding
export const getAddressFromCoordinates = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
    const data = await response.json();
    return data.display_name || 'Unknown Location';
  } catch (error) {
    console.error("Geocoding failed", error);
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
};

// Use OpenStreetMap Nominatim for forward geocoding (Address Search)
export const getCoordinatesFromAddress = async (query: string): Promise<{lat: number, lng: number, displayName: string} | null> => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name
      };
    }
    return null;
  } catch (error) {
    console.error("Forward geocoding failed", error);
    return null;
  }
};

export const buildGoogleMapsRouteUrl = (origin: Coordinates, stops: Customer[]): string => {
  if (stops.length === 0) return '';
  
  const baseUrl = "https://www.google.com/maps/dir/?api=1";
  const originStr = `${origin.lat},${origin.lng}`;
  
  // Last stop is the destination
  const destination = stops[stops.length - 1];
  const destStr = `${destination.coordinates.lat},${destination.coordinates.lng}`;
  
  // Intermediate stops (waypoints)
  const waypoints = stops.slice(0, stops.length - 1);
  const waypointsStr = waypoints.map(s => `${s.coordinates.lat},${s.coordinates.lng}`).join('|');
  
  let url = `${baseUrl}&origin=${originStr}&destination=${destStr}`;
  if (waypointsStr) {
    url += `&waypoints=${waypointsStr}`;
  }
  return url;
};