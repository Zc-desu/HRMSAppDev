declare module 'current-location-geo' {
  interface LocationResult {
    lat: number;
    lng: number;
    accuracy?: number;
    timestamp?: number;
  }

  export default function currentLocation(): Promise<LocationResult>;
} 