import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text,
  Image,
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity, 
  Alert,
  Dimensions,
  Platform,
  useColorScheme,
  PermissionsAndroid,
  NativeModules,
  Linking,
  NativeEventEmitter,
  Switch,
} from 'react-native';
import WebView from 'react-native-webview';
import { useTheme } from '../setting/ThemeContext';
import { useLanguage } from '../setting/LanguageContext';
import Geolocation from 'react-native-geolocation-service';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../../modules/setting/CustomAlert';
import NetInfo from '@react-native-community/netinfo';
import currentLocation from 'current-location-geo';
import GetLocation from 'react-native-get-location';

// Translations object
const translations = {
  'en': {
    loading: 'Loading location...',
    locationError: 'Unable to get your location. Using default location.',
    errorTitle: 'Location Error',
    ok: 'OK',
    status: 'Status',
    withinRange: 'Within office range',
    outsideRange: 'Outside office range',
    clockIn: 'Clock In',
    clockOut: 'Clock Out',
    errorRange: 'You must be within office range to clock in/out',
    success: 'Success',
    successClockIn: 'Successfully clocked in!',
    successClockOut: 'Successfully clocked out!',
    errorLoadingMap: 'Error loading map. Using default location.',
    yourLocation: 'Your Location',
    office: 'Office',
    gpsNotAvailable: 'GPS Not Available',
    fetchError: 'Error fetching authorized zones',
    instruction: 'Please ensure GPS is enabled, network signal is available, and you are within office range',
    backDateApplication: 'Apply for Back Date',
    pleaseWait: 'Please wait while we get your location...',
  },
  'ms': {
    loading: 'Memuat lokasi...',
    locationError: 'Tidak dapat mendapatkan lokasi anda. Menggunakan lokasi lalai.',
    errorTitle: 'Ralat Lokasi',
    ok: 'OK',
    status: 'Status',
    withinRange: 'Dalam lingkungan pejabat',
    outsideRange: 'Di luar lingkungan pejabat',
    clockIn: 'Daftar Masuk',
    clockOut: 'Daftar Keluar',
    errorRange: 'Anda mesti berada dalam lingkungan pejabat untuk daftar masuk/keluar',
    success: 'Berjaya',
    successClockIn: 'Berjaya daftar masuk!',
    successClockOut: 'Berjaya daftar keluar!',
    errorLoadingMap: 'Ralat memuatkan peta. Menggunakan lokasi lalai.',
    yourLocation: 'Lokasi Anda',
    office: 'Pejabat',
    gpsNotAvailable: 'GPS Tidak Tersedia',
    fetchError: 'Ralat mendapatkan zon yang dibenarkan',
    instruction: 'Sila pastikan GPS diaktifkan, isyarat rangkaian tersedia, dan anda berada dalam lingkungan pejabat',
    backDateApplication: 'Permohonan Tarikh Lampau',
    pleaseWait: 'Sila tunggu sementara kami mendapatkan lokasi anda...',
  },
  'zh-Hans': {
    loading: '正在加载位置...',
    locationError: '无法获取您的位置。使用默认位置。',
    errorTitle: '位置错误',
    ok: '确定',
    status: '状态',
    withinRange: '在办公范围内',
    outsideRange: '在办公范围外',
    clockIn: '签到',
    clockOut: '签退',
    errorRange: '您必须在办公范围内才能签到/签退',
    success: '成功',
    successClockIn: '签到成功！',
    successClockOut: '签退成功！',
    errorLoadingMap: '加载地图错误。使用默认位置。',
    yourLocation: '您的位置',
    office: '办公室',
    gpsNotAvailable: 'GPS不可用',
    fetchError: '获取授权区域时出错',
    instruction: '请确保GPS已启用，网络信号可用，且您在办公室范围内',
    backDateApplication: '补打卡申请',
    pleaseWait: '正在获取您的位置，请稍候...',
  },
  'zh-Hant': {
    loading: '正在載入位置...',
    locationError: '無法獲取您的位置。使用預設位置。',
    errorTitle: '位置錯誤',
    ok: '確定',
    status: '狀態',
    withinRange: '在辦公範圍內',
    outsideRange: '在辦公室圍外',
    clockIn: '簽到',
    clockOut: '簽退',
    errorRange: '您必須在辦公室範圍內才能簽到/簽退',
    success: '成功',
    successClockIn: '簽到成功！',
    successClockOut: '簽退成功！',
    errorLoadingMap: '載入地圖錯誤。使用預設位置。',
    yourLocation: '您的位置',
    office: '辦公室',
    gpsNotAvailable: 'GPS不可用',
    fetchError: '獲取授權區域出錯',
    instruction: '請確保GPS已啟用，網絡訊號可用，並且您在辦公室範圍內',
    backDateApplication: '補打卡申請',
    pleaseWait: '正在獲取您的位置，請稍候...',
  }
} as const;

// Function to calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180; // φ, λ in radians
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  const distance = R * c; // Distance in meters
  
  return distance;
};

// Add interface for authorized zone
interface AuthorizedZone {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  outOfFenceOverride: boolean;
}

// Add interface for alert button
interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

interface Props {
  route: any;
  navigation: any;
}

const { LocationServicesDialogBox } = NativeModules;

interface LocationState {
  latitude: number;
  longitude: number;
  isLoading: boolean;
  error: string | null;
}

const checkGooglePlayServices = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;
  
  try {
    // Check if Google Play Services is available using native modules
    const playStorePackage = 'com.android.vending';
    const playServicesPackage = 'com.google.android.gms';
    
    // Simple check if Play Store and Play Services packages are installed
    const checkPackage = async (packageName: string) => {
      try {
        await NativeModules.PackageManager.getPackageInfo(packageName);
        return true;
      } catch {
        return false;
      }
    };

    const hasPlayStore = await checkPackage(playStorePackage);
    const hasPlayServices = await checkPackage(playServicesPackage);

    return hasPlayStore && hasPlayServices;
  } catch (error) {
    console.warn('Error checking Google Play Services:', error);
    return true; // Return true on error to not block functionality
  }
};

const ATShowMap = ({ route, navigation }: Props) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations];
  const colorScheme = useColorScheme();

  // Get params from route with proper type checking
  const routeParams = route.params || {};
  const routeEmployeeId = routeParams.employeeId;
  const routeCompanyId = routeParams.companyId;
  const routeBaseUrl = routeParams.baseUrl;

  // Add validation check for required params
  useEffect(() => {
    if (!routeEmployeeId || !routeCompanyId || !routeBaseUrl) {
      console.error('Missing required params:', { routeEmployeeId, routeCompanyId, routeBaseUrl });
      showAlert(t.errorTitle, 'Missing required data');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
      return;
    }
  }, [routeEmployeeId, routeCompanyId, routeBaseUrl]);

  // Update state initialization
  const [baseUrl, setBaseUrl] = useState<string>(routeBaseUrl || '');
  const [employeeId, setEmployeeId] = useState<string>(routeEmployeeId || '');
  const [companyId, setCompanyId] = useState<string>(routeCompanyId || '');

  // Set header theme
  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: theme.headerBackground,
        shadowColor: 'transparent',
        elevation: 0,
      },
      headerTintColor: theme.headerText,
      headerTitleStyle: {
        color: theme.headerText,
      },
      headerShadowVisible: false,
    });
  }, [navigation, theme]);

  // Set default location (can be your office location)
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 0,
    longitude: 0,
  });
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [locationText, setLocationText] = useState('');
  const [isWithinRange, setIsWithinRange] = useState(false);
  const [lastClockAction, setLastClockAction] = useState<string>('');
  const [hasError, setHasError] = useState(false);

  // Office location state
  const [officeLocation, setOfficeLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [allowedRadius, setAllowedRadius] = useState(100); // Radius in meters within which clock in/out is allowed

  // Add new states
  const [authorizedZones, setAuthorizedZones] = useState<AuthorizedZone[]>([]);
  const [gpsNotAvailable, setGpsNotAvailable] = useState(false);
  
  // Add loading state
  const [isInitialLocationSet, setIsInitialLocationSet] = useState(false);

  // Add state for CustomAlert
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    message: string;
    buttons: AlertButton[];
  }>({
    title: '',
    message: '',
    buttons: [],
  });

  // Add showAlert helper function
  const showAlert = (title: string, message: string) => {
    setAlertConfig({
      title,
      message,
      buttons: [{
        text: t.ok,
        style: 'default' as const,
        onPress: () => setAlertVisible(false),
      }],
    });
    setAlertVisible(true);
  };

  // Fetch authorized zones
  useEffect(() => {
    const fetchAuthorizedZones = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        if (!userToken) throw new Error('No authentication token found');

        const response = await fetch(
          `${baseUrl}/apps/api/v1/attendance/authorized-zones`,
          {
            headers: {
              'Authorization': `Bearer ${userToken}`,
              'Accept': 'application/json',
            },
          }
        );

        const data = await response.json();
        if (data.success && data.data.length > 0) {
          const zone = data.data[0];
          setAuthorizedZones(data.data);
          setOfficeLocation({
            latitude: zone.latitude,
            longitude: zone.longitude,
          });
          setAllowedRadius(zone.radius);
        }
      } catch (error) {
        console.error('Error fetching authorized zones:', error);
      }
    };

    fetchAuthorizedZones();
  }, [baseUrl, companyId]);

  // Custom debounce hook
  function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  }

  // Properly typed state
  const [locationState, setLocationState] = useState<LocationState>({
    latitude: 0,
    longitude: 0,
    isLoading: false,
    error: null
  });

  const debouncedLocation = useDebounce(locationState, 1000);
  const lastDistance = useRef<number>(0);
  const watchIdRef = useRef<number | null>(null);

  // Add these state variables at the top of your component
  const [stableLocation, setStableLocation] = useState<LocationState>({
    latitude: 0,
    longitude: 0,
    isLoading: false,
    error: null
  });
  const lastLocationUpdate = useRef(Date.now());
  const locationBuffer = useRef<LocationState[]>([]);

  const BUFFER_SIZE = 5; // Keep last 5 readings
  const DISTANCE_THRESHOLD = 10; // 10 meters threshold for change
  const UPDATE_INTERVAL = 10000; // 10 seconds

  // Remove duplicate locationBuffer declaration since it's already declared above
  const lastStatusUpdate = useRef<number>(0);

  const checkLocationRange = useCallback((location: Pick<LocationState, 'latitude' | 'longitude'>) => {
    try {
      const now = Date.now();
      if (now - lastStatusUpdate.current < UPDATE_INTERVAL) {
        return; // Don't update too frequently
      }

      // Add to buffer
      locationBuffer.current.push({
        ...location,
        isLoading: false,
        error: null
      });

      // Keep buffer size limited
      if (locationBuffer.current.length > BUFFER_SIZE) {
        locationBuffer.current.shift();
      }

      // Only proceed if we have enough readings
      if (locationBuffer.current.length >= 3) {
        // Calculate median position (more stable than average)
        const sortedLat = [...locationBuffer.current].sort((a, b) => a.latitude - b.latitude);
        const sortedLng = [...locationBuffer.current].sort((a, b) => a.longitude - b.longitude);
        const medianLocation = {
          latitude: sortedLat[Math.floor(sortedLat.length / 2)].latitude,
          longitude: sortedLng[Math.floor(sortedLng.length / 2)].longitude
        };

        if (!officeLocation) return;

        const distance = calculateDistance(
          medianLocation.latitude,
          medianLocation.longitude,
          officeLocation.latitude,
          officeLocation.longitude
        );

        // Only update status if change is significant
        if (Math.abs(distance - lastDistance.current) > DISTANCE_THRESHOLD) {
          const withinRange = distance <= (allowedRadius + DISTANCE_THRESHOLD);
          setIsWithinRange(withinRange);
          setLocationText(withinRange ? t.withinRange : t.outsideRange);
          lastDistance.current = distance;
          lastStatusUpdate.current = now;
        }
      }
    } catch (error) {
      console.error('Error checking location range:', error);
    }
  }, [officeLocation, allowedRadius, t]);

  // Update watchLocation function with less frequent updates
  const watchLocation = useCallback((): number => {
    return Geolocation.watchPosition(
      (position) => {
        const newLocation: LocationState = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          isLoading: false,
          error: null
        };
        
        // Significant change threshold increased
        const threshold = 0.00002; // Approximately 2 meters
        
        setLocationState(prev => {
          if (Math.abs(prev.latitude - newLocation.latitude) > threshold ||
              Math.abs(prev.longitude - newLocation.longitude) > threshold) {
            return newLocation;
          }
          return prev;
        });
      },
      (error) => {
        setLocationState(prev => ({
          ...prev,
          isLoading: false,
          error: error.message
        }));
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 15, // Increased from 10 to 15 meters
        interval: 10000, // Increased from 5000 to 10000 ms
        fastestInterval: 5000, // Increased from 3000 to 5000 ms
        forceRequestLocation: true,
      }
    );
  }, []);

  useEffect(() => {
    const initLocation = async () => {
      try {
        const hasPermission = await checkGPSStatus();
        if (!hasPermission) return;

        watchIdRef.current = watchLocation();
      } catch (error) {
        console.error('Location initialization error:', error);
        setLocationState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }));
      }
    };

    initLocation();

    return () => {
      if (watchIdRef.current !== null) {
        Geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [watchLocation]);

  useEffect(() => {
    if (debouncedLocation.latitude && debouncedLocation.longitude) {
      checkLocationRange(debouncedLocation);
    }
  }, [debouncedLocation, checkLocationRange]);

  // Handle GPS Not Available toggle
  const handleGPSToggle = async () => {
    const newGPSNotAvailable = !gpsNotAvailable;
    setGpsNotAvailable(newGPSNotAvailable);
    
    if (newGPSNotAvailable) {
      setIsWithinRange(true); // Allow clock in/out if GPS not available
    } else {
      // When turning GPS back on, keep the previous state until we get a new location
      setIsLocationLoading(true); // Show loading state
      
      try {
        // Get current position first
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          Geolocation.getCurrentPosition(
            (pos) => resolve(pos as GeolocationPosition),
            (error) => reject(error),
            { 
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 10000
            }
          );
        });

        // Update location and check range before changing any states
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };

        setLocation(newLocation);
        setCurrentLocation(newLocation);
        checkLocationRange(newLocation);
        updateWebViewLocation(newLocation.latitude, newLocation.longitude);
        setIsGPSEnabled(true);
        
        // Only now start the continuous location watching
        setupLocation();
      } catch (error) {
        console.error('Error getting location:', error);
        setIsGPSEnabled(false);
        setIsWithinRange(false); // Only set to false if we can't get location
      } finally {
        setIsLocationLoading(false);
      }
    }
  };

  // Handle Clock In/Out
  const handleClockAction = (action: 'in' | 'out') => {
    if (!isWifiEnabled && !gpsNotAvailable) {
      showAlert('Network Error', 'Please enable WiFi or mobile data');
      return;
    }

    if (!isGPSEnabled && !gpsNotAvailable) {
      showAlert('GPS Error', 'Please enable GPS or use GPS Not Available option');
      return;
    }

    if (!isWithinRange && !gpsNotAvailable) {
      showAlert('Location Error', 'You must be within office range or use GPS Not Available option');
      return;
    }

    // Create reason with clock action
    const clockAction = action === 'in' ? 'Clock In' : 'Clock Out';

    navigation.navigate('ATPhotoCapture', {
      timeEntry: new Date().toISOString(),
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      latitudeDelta: 0.0018,
      longitudeDelta: 0.0018,
      address: `${currentLocation.latitude},${currentLocation.longitude}`,
      authorizeZoneName: authorizedZones[0]?.name || '',
      isOutOfFence: !isWithinRange && !gpsNotAvailable,
      gpsNotAvailable,
      employeeId,
      companyId,
      baseUrl,
      autoReason: clockAction // Pass the clock action as reason
    });
  };

  const [location, setLocation] = useState({
    latitude: 0,
    longitude: 0
  });

  // Request location permission
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Location Permission",
          message: "App needs access to your location for attendance",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  // Get current location
  const getCurrentLocation = async () => {
    try {
      setIsLocationLoading(true);

      // Check if location service is enabled
      const enabled = await Geolocation.requestAuthorization('whenInUse');
      if (!enabled) {
        setIsLocationLoading(false);
        setIsGPSEnabled(false);
        return;
      }

      // Get current position
      Geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          
          console.log('New location:', newLocation);
          setLocation(newLocation);
          setCurrentLocation(newLocation);
          checkLocationRange(newLocation);
          updateWebViewLocation(newLocation.latitude, newLocation.longitude);
          setIsLocationLoading(false);
          setIsGPSEnabled(true);
        },
        (error) => {
          console.error('Location error:', error);
          setIsLocationLoading(false);
          setIsGPSEnabled(false);
        },
        { 
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
          distanceFilter: 10
        }
      );
    } catch (error) {
      console.error('Location setup error:', error);
      setIsLocationLoading(false);
      setIsGPSEnabled(false);
    }
  };

  // Add watchPosition to continuously monitor location
  const startLocationWatch = () => {
    const watchId = Geolocation.watchPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        
        console.log('Location update:', newLocation);
        setLocation(newLocation);
        setCurrentLocation(newLocation);
        checkLocationRange(newLocation);
        updateWebViewLocation(newLocation.latitude, newLocation.longitude);
        setIsGPSEnabled(true);
      },
      (error) => {
        console.error('Watch error:', error);
        setIsGPSEnabled(false);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 5, // Update every 5 meters
        interval: 3000, // Update every 3 seconds
        fastestInterval: 2000,
        forceRequestLocation: true,
        showLocationDialog: true
      }
    );

    return watchId;
  };

  // Update useEffect to use the watcher
  useEffect(() => {
    let watchId: number;

    const initLocation = async () => {
      try {
        // Get initial location
        await getCurrentLocation();
        
        // Start watching location
        watchId = startLocationWatch();
      } catch (error) {
        console.error('Location initialization error:', error);
      }
    };

    initLocation();

    // Cleanup
    return () => {
      if (watchId) {
        Geolocation.clearWatch(watchId);
        Geolocation.stopObserving();
      }
    };
  }, []);

  // Handle my location button press
  const handleMyLocationPress = () => {
    getCurrentLocation();
  };

  // Check network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsWifiEnabled(state.isConnected || false);
    });

    return () => unsubscribe();
  }, []);

  // Update your createMapHTML function to use the current location
  const createMapHTML = (currentLat: number, currentLng: number) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; }
          #map { height: 100vh; width: 100vw; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map').setView([${currentLat}, ${currentLng}], 17);
          
          // Use standard map tiles (not themed)
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '©OpenStreetMap'
          }).addTo(map);

          // Custom icons
          const userIcon = L.divIcon({
            html: '<div style="background-color: #007AFF; width: 16px; height: 16px; border-radius: 8px; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>',
            className: 'custom-marker',
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          });

          const officeIcon = L.divIcon({
            html: '<div style="background-color: #FF3B30; width: 16px; height: 16px; border-radius: 8px; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>',
            className: 'custom-marker',
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          });

          // Add markers
          const userMarker = L.marker([${currentLat}, ${currentLng}], {icon: userIcon}).addTo(map);
          userMarker.bindTooltip('${t.yourLocation}', {
            permanent: true,
            direction: 'top',
            offset: [0, -20],
            className: 'custom-marker-label'
          });

          const officeMarker = L.marker([${officeLocation?.latitude ?? 0}, ${officeLocation?.longitude ?? 0}], {icon: officeIcon}).addTo(map);
          officeMarker.bindTooltip('${t.office}', {
            permanent: true,
            direction: 'top',
            offset: [0, -20],
            className: 'custom-marker-label'
          });
          // Add office radius circle
          L.circle([${officeLocation?.latitude ?? 0}, ${officeLocation?.longitude ?? 0}], {
            radius: ${allowedRadius},
            color: '#FF3B30',
            fillColor: '#FF3B30',
            fillOpacity: 0.15,
            weight: 2
          }).addTo(map);

          // Function to update user location
          window.updateLocation = function(lat, lng) {
            userMarker.setLatLng([lat, lng]);
            map.setView([lat, lng], map.getZoom());
          };
        </script>
      </body>
    </html>
  `;

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'location') {
        const newLocation = {
          latitude: data.latitude,
          longitude: data.longitude,
        };
        setCurrentLocation(newLocation);
        checkLocationRange(newLocation);
        setIsLocationLoading(false);
      } else if (data.type === 'error') {
        console.error('Location error:', data.message);
        // Just use default location instead of trying IP-based location
        checkLocationRange(currentLocation);
        setIsLocationLoading(false);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
      setIsLocationLoading(false);
    }
  };

  const getLocationFromIP = async () => {
    try {
      // Mock location for testing (KL coordinates)
      const mockLocation = {
        latitude: 3.1390,
        longitude: 101.6869
      };
      
      setCurrentLocation(mockLocation);
      checkLocationRange(mockLocation);
      setIsLocationLoading(false);
      
    } catch (error) {
      console.error('Error getting location:', error);
      showAlert(t.errorTitle, t.locationError);
      setIsLocationLoading(false);
    }
  };

  const checkLocationServices = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        
        if (!granted) {
          const permission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: "Location Permission",
              message: "This app needs access to your location",
              buttonNeutral: "Ask Me Later",
              buttonNegative: "Cancel",
              buttonPositive: "OK"
            }
          );
          
          if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
            return false;
          }
        }
        return true;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const webViewRef = useRef<WebView>(null);

  // Function to update WebView marker
  const updateWebViewLocation = (latitude: number, longitude: number) => {
    if (!officeLocation) return;
    webViewRef.current?.injectJavaScript(`
      window.updateLocation(${latitude}, ${longitude});
      true;
    `);
  };

  // Add new states
  const [isWifiEnabled, setIsWifiEnabled] = useState(false);
  const [isGPSEnabled, setIsGPSEnabled] = useState(false);

  // Add function to check network status
  const checkNetworkStatus = async () => {
    try {
      const state = await NetInfo.fetch();
      setIsWifiEnabled(state.isConnected || false);
      console.log('Network status:', state);
    } catch (error) {
      console.error('Network check error:', error);
    }
  };

  const checkGPSStatus = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        
        if (!granted) {
          const permission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: "Location Permission",
              message: "This app needs access to your location",
              buttonNeutral: "Ask Me Later",
              buttonNegative: "Cancel",
              buttonPositive: "OK"
            }
          );
          
          setIsGPSEnabled(permission === PermissionsAndroid.RESULTS.GRANTED);
          return permission === PermissionsAndroid.RESULTS.GRANTED;
        }
        
        setIsGPSEnabled(true);
        return true;
      }
      return true;
    } catch (error) {
      console.error('GPS check error:', error);
      setIsGPSEnabled(false);
      return false;
    }
  };

  // Update setupLocation function with detailed logging
  const setupLocation = async () => {
    try {
      const hasLocationPermission = await checkLocationServices();
      if (!hasLocationPermission) {
        setIsGPSEnabled(false);
        return;
      }

      const watchId = Geolocation.watchPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setCurrentLocation(newLocation);
          checkLocationRange(newLocation);
          setIsLocationLoading(false);
          setIsGPSEnabled(true);
        },
        (error) => {
          console.log('Location error:', error);
          setIsGPSEnabled(false);
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 5,
          interval: 3000,
          fastestInterval: 2000,
          forceRequestLocation: true
        }
      );

      return () => Geolocation.clearWatch(watchId);
    } catch (error) {
      console.error('Setup error:', error);
      setIsGPSEnabled(false);
    }
  };

  // Update useEffect to handle all checks
  useEffect(() => {
    const networkListener = NetInfo.addEventListener(state => {
      setIsWifiEnabled(state.isConnected || false);
    });

    checkNetworkStatus();
    checkGPSStatus();
    setupLocation();

    return () => {
      networkListener();
    };
  }, []);

  // Add GPS status check and listener
  useEffect(() => {
    const checkGPS = async () => {
      try {
        // Initial GPS check
        Geolocation.getCurrentPosition(
          () => setIsGPSEnabled(true),
          () => setIsGPSEnabled(false),
          { 
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        );
      } catch (error) {
        console.error('GPS check failed:', error);
      }
    };

    // Check GPS status initially
    checkGPS();

    // Set up location watcher to monitor GPS status
    const watchId = Geolocation.watchPosition(
      () => setIsGPSEnabled(true),
      () => setIsGPSEnabled(false),
      {
        enableHighAccuracy: true,
        distanceFilter: 0,
        interval: 5000,
        fastestInterval: 2000
      }
    );

    // Cleanup
    return () => {
      Geolocation.clearWatch(watchId);
    };
  }, []);

  // Initialize Geolocation when component mounts
  useEffect(() => {
    // Configure Geolocation
    Geolocation.requestAuthorization('whenInUse');

    // Request permissions
    requestLocationPermission();
  }, []);

  // Add getStatusText function
  const getStatusText = () => {
    if (gpsNotAvailable) return 'GPS Not Available Mode';
    if (isLocationLoading) return t.loading;
    if (!isGPSEnabled) return t.gpsNotAvailable;
    if (!isWithinRange) return t.outsideRange;
    return t.withinRange;
  };

  // Update the useEffect that uses checkGPSStatus
  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (Platform.OS === 'android') {
        checkGPSStatus();
      }
    }, 5000);

    return () => clearInterval(checkInterval);
  }, []);

  // Add error handling for Google Play Services
  const checkPlayServices = async () => {
    try {
      if (Platform.OS === 'android') {
        const playServicesAvailable = await checkGooglePlayServices();
        return playServicesAvailable;
      }
      return true;
    } catch (error) {
      console.error('Play Services check error:', error);
      return true; // Continue anyway on error
    }
  };

  // Update initializeLocation with better error handling
  const initializeLocation = async () => {
    try {
      if (Platform.OS === 'android') {
        await checkPlayServices();
      }

      setIsLocationLoading(true);
      // Remove the error alert and just update the GPS status
      const watchId = Geolocation.watchPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          
          if (calculateDistance(
            newLocation.latitude,
            newLocation.longitude,
            currentLocation.latitude,
            currentLocation.longitude
          ) > 10) {
            setCurrentLocation(newLocation);
            checkLocationRange(newLocation);
          }
          setIsGPSEnabled(true);
        },
        (error) => {
          console.error('Location error:', error);
          setIsGPSEnabled(false);
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 15,
          interval: 10000,
          fastestInterval: 5000,
          forceRequestLocation: true,
        }
      );

      return watchId;
    } catch (error) {
      console.error('Location initialization error:', error);
      setIsGPSEnabled(false);
      return null;
    }
  };

  // Update useEffect
  useEffect(() => {
    let watchId: number | null = null;
    let mounted = true;

    const setup = async () => {
      try {
        if (mounted) {
          const id = await initializeLocation();
          if (id && mounted) {
            watchId = id;
          }
        }
      } catch (error) {
        console.error('Setup error:', error);
      }
    };

    setup();

    return () => {
      mounted = false;
      if (watchId !== null) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, []);

  const handleBackDatePress = () => {
    navigation.navigate('ATBackDateTLApplication', {
      employeeId,
      companyId,
      baseUrl
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[
        styles.instructionContainer, 
        { 
          backgroundColor: theme.card,
          borderColor: theme.border,
          borderWidth: 1,
        }
      ]}>
        <Text style={[styles.instructionText, { color: theme.text }]}>
          {t.instruction}
        </Text>
        <View style={styles.statusContainer}>
          <View style={styles.statusItem}>
            <Image 
              source={require('../../../../asset/img/icon/WIFI.png')}
              style={[styles.statusIcon, { 
                opacity: isWifiEnabled ? 1 : 0.5,
                tintColor: theme.text 
              }]}
            />
            <Image 
              source={isWifiEnabled ? 
                require('../../../../asset/img/icon/a-circle-check-filled.png') :
                require('../../../../asset/img/icon/a-circle-close-filled.png')
              }
              style={[styles.statusIndicator, { 
                tintColor: isWifiEnabled ? theme.success : theme.error 
              }]}
            />
          </View>
          <View style={styles.statusItem}>
            <Image 
              source={require('../../../../asset/img/icon/a-location.png')}
              style={[styles.statusIcon, { 
                opacity: isGPSEnabled ? 1 : 0.5,
                tintColor: theme.text 
              }]}
            />
            <Image 
              source={isGPSEnabled ? 
                require('../../../../asset/img/icon/a-circle-check-filled.png') :
                require('../../../../asset/img/icon/a-circle-close-filled.png')
              }
              style={[styles.statusIndicator, { 
                tintColor: isGPSEnabled ? theme.success : theme.error 
              }]}
            />
          </View>
        </View>
      </View>
      
      <TouchableOpacity 
        style={[styles.myLocationButton, {
          backgroundColor: theme.card,
          borderColor: theme.border,
          borderWidth: 1,
        }]}
        onPress={handleMyLocationPress}
      >
        <Image 
          source={require('../../../../asset/img/icon/a-location.png')}
          style={[styles.locationIcon, { tintColor: theme.primary }]}
        />
      </TouchableOpacity>

      <WebView
        ref={webViewRef}
        style={styles.map}
        source={{ html: createMapHTML(currentLocation.latitude, currentLocation.longitude) }}
        javaScriptEnabled={true}
        onMessage={handleWebViewMessage}
      />

      <View style={[
        styles.bottomContainer,
        {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          borderTopWidth: 1,
        }
      ]}>
        <Text style={[styles.locationStatus, { color: theme.text }]}>
          {getStatusText()}
        </Text>

        <TouchableOpacity 
          style={[styles.gpsToggleBar, {
            backgroundColor: theme.background,
            borderColor: theme.border,
            borderWidth: 1,
          }]}
          onPress={handleGPSToggle}
        >
          <Text style={[styles.gpsToggleText, { color: theme.text }]}>
            GPS Not Available
          </Text>
          <View style={[styles.gpsCheckbox, { borderColor: theme.primary }]}>
            {gpsNotAvailable && (
              <View style={[styles.checkmark, { backgroundColor: theme.primary }]} />
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.backDateButton, { backgroundColor: theme.primary }]}
          onPress={handleBackDatePress}
        >
          <Text style={[styles.backDateButtonText, { color: '#FFFFFF' }]}>
            {t.backDateApplication}
          </Text>
        </TouchableOpacity>

        <View style={styles.clockButtonsRow}>
          <TouchableOpacity 
            style={[
              styles.clockButton,
              { backgroundColor: theme.primary },
              (!isWithinRange && !gpsNotAvailable) && { opacity: 0.5 }
            ]}
            onPress={() => handleClockAction('in')}
            disabled={!isWithinRange && !gpsNotAvailable}
          >
            <Text style={styles.clockButtonText}>{t.clockIn}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.clockButton,
              { backgroundColor: theme.primary },
              (!isWithinRange && !gpsNotAvailable) && { opacity: 0.5 }
            ]}
            onPress={() => handleClockAction('out')}
            disabled={!isWithinRange && !gpsNotAvailable}
          >
            <Text style={styles.clockButtonText}>{t.clockOut}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onDismiss={() => setAlertVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  instructionContainer: {
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 8,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 12,
  },
  statusIcon: {
    width: 24,
    height: 24,
    tintColor: '#000000',
  },
  statusIndicator: {
    width: 16,
    height: 16,
    marginLeft: 4,
  },
  myLocationButton: {
    position: 'absolute',
    right: 16,
    top: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1,
  },
  locationIcon: {
    width: 24,
    height: 24,
    tintColor: '#007AFF',
  },
  map: {
    flex: 1,
  },
  bottomContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  locationStatus: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 16,
  },
  gpsToggleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  gpsToggleText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  gpsCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#007AFF',
  },
  backDateButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  backDateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  clockButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  clockButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  clockButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ATShowMap;
