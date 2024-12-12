import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
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
} from 'react-native';
import WebView from 'react-native-webview';
import { useTheme } from '../setting/ThemeContext';
import { useLanguage } from '../setting/LanguageContext';
import Geolocation from '@react-native-community/geolocation';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../../modules/setting/CustomAlert';
import NetInfo from '@react-native-community/netinfo';

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
    instruction: '请确保GPS已启用，网络信号可用，并且您在办公室范围内',
    backDateApplication: '补打卡申请',
  },
  'zh-Hant': {
    loading: '正在載入位置...',
    locationError: '無法獲取您的位置。使用預設位置。',
    errorTitle: '位置錯誤',
    ok: '確定',
    status: '狀態',
    withinRange: '在辦公範圍內',
    outsideRange: '在辦公範圍外',
    clockIn: '簽到',
    clockOut: '簽退',
    errorRange: '您必須在辦公範圍內才能簽到/簽退',
    success: '成功',
    successClockIn: '簽到成功！',
    successClockOut: '簽退成功！',
    errorLoadingMap: '載入地圖錯誤。使用預設位置。',
    yourLocation: '您的位置',
    office: '辦公室',
    gpsNotAvailable: 'GPS不可用',
    fetchError: '獲取授權區域時出錯',
    instruction: '請確保GPS已啟用，網絡訊號可用，並且您在辦公室範圍內',
    backDateApplication: '補打卡申請',
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

const ATShowMap = ({ route, navigation }: Props) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations];

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
    latitude: 3.1390,
    longitude: 101.6869,
  });
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [isWithinRange, setIsWithinRange] = useState(false);
  const [lastClockAction, setLastClockAction] = useState<string>('');
  const [hasError, setHasError] = useState(false);

  // Office location state
  const [officeLocation, setOfficeLocation] = useState({
    latitude: 3.1390,
    longitude: 101.6869,
  });
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

  // Update fetchAuthorizedZones to use companyId from route params
  useEffect(() => {
    const fetchAuthorizedZones = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        
        if (!userToken || !baseUrl || !companyId) {
          throw new Error('Missing required authentication data');
        }

        const response = await fetch(
          `${baseUrl}/apps/api/v1/attendance/authorized-zones?companyId=${companyId}`,
          {
            headers: {
              'Authorization': `Bearer ${userToken}`,
              'Accept': 'application/json',
            },
          }
        );
        
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
          setAuthorizedZones(data.data);
          const zone = data.data[0];
          
          setOfficeLocation({
            latitude: zone.latitude,
            longitude: zone.longitude,
          });
          
          setAllowedRadius(zone.radius);
        }
      } catch (error) {
        console.error('Error fetching authorized zones:', error);
        showAlert(t.errorTitle, t.fetchError);
      }
    };

    if (baseUrl && companyId) {
      fetchAuthorizedZones();
    }
  }, [baseUrl, companyId]);

  const createMapHTML = (currentLat: number, currentLng: number) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
        <style>
          #map { height: 100vh; width: 100vw; }
          body { margin: 0; }
          .custom-marker-label {
            background: none;
            border: none;
            box-shadow: none;
            font-weight: bold;
            font-size: 14px;
          }
          /* Updated zoom control styles */
          .leaflet-control-zoom {
            position: fixed !important;
            bottom: 180px !important;
            right: 16px !important;
            z-index: 1000 !important;
          }
          .leaflet-control-zoom a {
            width: 44px !important;
            height: 44px !important;
            line-height: 44px !important;
            font-size: 24px !important;
            background-color: white !important;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2) !important;
          }
          .leaflet-control-zoom-in {
            border-top-left-radius: 8px !important;
            border-top-right-radius: 8px !important;
            margin-bottom: 1px !important;
          }
          .leaflet-control-zoom-out {
            border-bottom-left-radius: 8px !important;
            border-bottom-right-radius: 8px !important;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
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

          const map = L.map('map').setView([${currentLat}, ${currentLng}], 17);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          // Add user marker with label
          const userMarker = L.marker([${currentLat}, ${currentLng}], {icon: userIcon}).addTo(map);
          userMarker.bindTooltip('${t.yourLocation}', {
            permanent: true,
            direction: 'top',
            offset: [0, -20],
            className: 'custom-marker-label'
          });

          // Add office marker with label
          const officeMarker = L.marker([${officeLocation.latitude}, ${officeLocation.longitude}], {icon: officeIcon}).addTo(map);
          officeMarker.bindTooltip('${t.office}', {
            permanent: true,
            direction: 'top',
            offset: [0, -20],
            className: 'custom-marker-label'
          });
          
          // Add radius circle without label
          L.circle([${officeLocation.latitude}, ${officeLocation.longitude}], {
            radius: ${allowedRadius},
            color: '#FF3B30',
            fillColor: '#FF3B30',
            fillOpacity: 0.15,
            weight: 3
          }).addTo(map);

          // Function to update marker position
          window.updateLocation = function(lat, lng) {
            userMarker.setLatLng([lat, lng]);
            map.setView([lat, lng], 17);
          };

          // Fit bounds to show both markers
          const bounds = L.latLngBounds([
            [${currentLat}, ${currentLng}],
            [${officeLocation.latitude}, ${officeLocation.longitude}]
          ]);
          map.fitBounds(bounds, { padding: [50, 50] });
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

  const checkLocationRange = (location: { latitude: number; longitude: number }) => {
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      officeLocation.latitude,
      officeLocation.longitude
    );

    setIsWithinRange(distance <= allowedRadius);
  };

  // Update handleClockAction to ensure companyId is passed
  const handleClockAction = (action: 'in' | 'out') => {
    if (!isWithinRange && !authorizedZones[0]?.outOfFenceOverride) {
      showAlert(t.errorTitle, t.errorRange);
      return;
    }

    // Double check required data
    if (!employeeId || !companyId || !baseUrl) {
      console.error('Missing required data:', { employeeId, companyId, baseUrl });
      showAlert(t.errorTitle, 'Missing required data');
      return;
    }

    const timeEntry = new Date().toISOString();
    const currentZone = authorizedZones[0];

    navigation.navigate('ATPhotoCapture', {
      timeEntry,
      latitude: currentLocation.latitude,
      latitudeDelta: 0.0018,
      longitude: currentLocation.longitude,
      longitudeDelta: 0.0018,
      address: `${currentLocation.latitude},${currentLocation.longitude}`,
      authorizeZoneName: currentZone?.name || '',
      isOutOfFence: !isWithinRange,
      gpsNotAvailable,
      employeeId,
      companyId,  // Make sure companyId is passed
      baseUrl
    });
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

  const requestLocationPermission = async () => {
    try {
      const permission = Platform.select({
        android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      });

      if (!permission) return false;

      const result = await check(permission);
      
      if (result === RESULTS.DENIED) {
        const permissionResult = await request(permission);
        return permissionResult === RESULTS.GRANTED;
      }

      return result === RESULTS.GRANTED;
    } catch (error) {
      console.error('Error checking location permission:', error);
      return false;
    }
  };

  const webViewRef = useRef<WebView>(null);

  // Function to update WebView marker
  const updateWebViewLocation = (latitude: number, longitude: number) => {
    webViewRef.current?.injectJavaScript(`
      window.updateLocation(${latitude}, ${longitude});
      true;
    `);
  };

  useEffect(() => {
    let watchId: number;

    const setupLocation = async () => {
      const hasPermission = await requestLocationPermission();
      
      if (hasPermission) {
        // Get initial position
        Geolocation.getCurrentPosition(
          (position) => {
            const newLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            setCurrentLocation(newLocation);
            setIsInitialLocationSet(true);
            checkLocationRange(newLocation);
            setIsLocationLoading(false);
          },
          (error) => {
            console.log(error);
            setIsLocationLoading(false);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );

        // Watch position changes
        watchId = Geolocation.watchPosition(
          (position) => {
            const newLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            setCurrentLocation(newLocation);
            setIsInitialLocationSet(true);
            checkLocationRange(newLocation);
            updateWebViewLocation(newLocation.latitude, newLocation.longitude);
          },
          (error) => console.log(error),
          { enableHighAccuracy: true, distanceFilter: 10 }
        );
      } else {
        setIsLocationLoading(false);
      }
    };

    setupLocation();

    return () => {
      if (watchId !== undefined) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, [officeLocation, allowedRadius]);

  // Add states for network and GPS status
  const [isOnline, setIsOnline] = useState(true);
  const [isGPSEnabled, setIsGPSEnabled] = useState(true);

  // Add network check effect
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  // Add GPS check in your existing location effect
  useEffect(() => {
    const checkGPSStatus = () => {
      Geolocation.getCurrentPosition(
        () => setIsGPSEnabled(true),
        () => setIsGPSEnabled(false),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    };

    checkGPSStatus();
    const interval = setInterval(checkGPSStatus, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.instructionContainer, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]}>
        <Text style={[styles.instructionText, { color: '#FFFFFF' }]}>
          {t.instruction}
        </Text>
        <View style={styles.statusContainer}>
          <View style={styles.statusItem}>
            <Image 
              source={require('../../../../asset/img/icon/WIFI.png')}
              style={styles.statusIcon}
            />
            <Image 
              source={isOnline ? 
                require('../../../../asset/img/icon/a-circle-check-filled.png') :
                require('../../../../asset/img/icon/a-circle-close-filled.png')
              }
              style={[styles.statusIndicator, { tintColor: isOnline ? '#34C759' : '#FF3B30' }]}
            />
          </View>
          <View style={styles.statusItem}>
            <Image 
              source={require('../../../../asset/img/icon/a-location.png')}
              style={styles.statusIcon}
            />
            <Image 
              source={isGPSEnabled ? 
                require('../../../../asset/img/icon/a-circle-check-filled.png') :
                require('../../../../asset/img/icon/a-circle-close-filled.png')
              }
              style={[styles.statusIndicator, { tintColor: isGPSEnabled ? '#34C759' : '#FF3B30' }]}
            />
          </View>
        </View>
      </View>
      
      <WebView
        ref={webViewRef}
        style={styles.map}
        source={{ html: createMapHTML(currentLocation.latitude, currentLocation.longitude) }}
        javaScriptEnabled={true}
        onMessage={handleWebViewMessage}
      />

      <View style={[styles.bottomContainer, { backgroundColor: theme.card }]}>
        {isLocationLoading ? (
          <Text style={[styles.statusText, { color: theme.text }]}>
            {t.loading}
          </Text>
        ) : !isInitialLocationSet ? (
          <Text style={[styles.statusText, { color: theme.text }]}>
            {t.loading}
          </Text>
        ) : (
          <Text style={[styles.statusText, { color: theme.text }]}>
            {t.status}: {isWithinRange ? t.withinRange : t.outsideRange}
          </Text>
        )}

        <TouchableOpacity
          style={[styles.optionButton, { backgroundColor: theme.background }]}
          onPress={() => setGpsNotAvailable(!gpsNotAvailable)}
        >
          <Text style={[styles.optionText, { color: theme.text }]}>
            {t.gpsNotAvailable}
          </Text>
          <View style={styles.checkbox}>
            {gpsNotAvailable && <View style={styles.innerCircle} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.backDateButton, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('ATBackDateTLApplication', {
            employeeId,
            companyId,
            baseUrl
          })}
        >
          <Text style={styles.buttonText}>{t.backDateApplication}</Text>
        </TouchableOpacity>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={() => handleClockAction('in')}
            disabled={isLocationLoading || !isInitialLocationSet}
          >
            <Text style={styles.buttonText}>{t.clockIn}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={() => handleClockAction('out')}
            disabled={isLocationLoading || !isInitialLocationSet}
          >
            <Text style={styles.buttonText}>{t.clockOut}</Text>
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
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomContainer: {
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statusText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    marginTop: 10,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    marginHorizontal: 16,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  instructionContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    zIndex: 1,
    padding: 12,
    borderRadius: 8,
  },
  instructionText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 22,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    gap: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusIcon: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
  },
  statusIndicator: {
    width: 16,
    height: 16,
  },
  backDateButton: {
    marginHorizontal: 16,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
});

export default ATShowMap;
