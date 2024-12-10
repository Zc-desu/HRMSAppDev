import React, { useState, useEffect, useLayoutEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity, 
  Alert,
  Dimensions,
} from 'react-native';
import WebView from 'react-native-webview';
import { useTheme } from '../setting/ThemeContext';
import { useLanguage } from '../setting/LanguageContext';

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
    office: 'Office'
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
    office: 'Pejabat'
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
    office: '办公室'
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
    office: '辦公室'
  }
};

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

  return R * c; // Distance in meters
};

const ATShowMap = ({ route, navigation }: any) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = translations[language];

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

  // Office location (example coordinates - replace with actual office coordinates)
  const OFFICE_LOCATION = {
    latitude: 3.1390,
    longitude: 101.6869,
  };
  const ALLOWED_RADIUS = 100; // Radius in meters within which clock in/out is allowed

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
          /* Apply theme colors */
          .leaflet-container {
            background-color: ${theme.background};
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map').setView([${currentLat}, ${currentLng}], 15);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);
          
          L.marker([${currentLat}, ${currentLng}]).addTo(map)
            .bindPopup('${t.yourLocation}');
          L.marker([${OFFICE_LOCATION.latitude}, ${OFFICE_LOCATION.longitude}])
            .addTo(map)
            .bindPopup('${t.office}');
          
          L.circle([${OFFICE_LOCATION.latitude}, ${OFFICE_LOCATION.longitude}], {
            radius: ${ALLOWED_RADIUS},
            color: '${theme.primary}',
            fillColor: '${theme.primary}',
            fillOpacity: 0.1
          }).addTo(map);
        </script>
      </body>
    </html>
  `;

  const checkLocationRange = (position: any) => {
    if (!position || !position.latitude || !position.longitude) return false;
    
    const distance = calculateDistance(
      position.latitude,
      position.longitude,
      OFFICE_LOCATION.latitude,
      OFFICE_LOCATION.longitude
    );
    setIsWithinRange(distance <= ALLOWED_RADIUS);
    return distance <= ALLOWED_RADIUS;
  };

  const getLocationFromIP = async () => {
    try {
      setIsLocationLoading(true);
      setHasError(false);
      
      // Try multiple IP geolocation services
      const services = [
        'https://ipapi.co/json/',
        'https://ip-api.com/json/',
        'https://geolocation-db.com/json/'
      ];

      for (const service of services) {
        try {
          const response = await fetch(service);
          const data = await response.json();
          
          if (data.latitude && data.longitude) {
            const newLocation = {
              latitude: parseFloat(data.latitude),
              longitude: parseFloat(data.longitude),
            };
            setCurrentLocation(newLocation);
            checkLocationRange(newLocation);
            setIsLocationLoading(false);
            return;
          }
        } catch (error) {
          console.log(`Failed to fetch from ${service}:`, error);
          continue;
        }
      }
      
      throw new Error('Unable to get location from any service');
    } catch (error) {
      console.error('Error getting location:', error);
      setHasError(true);
      Alert.alert(
        'Location Error',
        'Unable to get your location. Using default location.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLocationLoading(false);
    }
  };

  const handleClockAction = (action: 'in' | 'out') => {
    if (!isWithinRange) {
      Alert.alert(t.errorTitle, t.errorRange);
      return;
    }

    const timestamp = new Date().toISOString();
    setLastClockAction(
      `${action === 'in' ? t.clockIn : t.clockOut}: ${new Date().toLocaleTimeString()}`
    );
    Alert.alert(t.success, action === 'in' ? t.successClockIn : t.successClockOut);
  };

  useEffect(() => {
    getLocationFromIP();
    const locationInterval = setInterval(getLocationFromIP, 300000);
    return () => clearInterval(locationInterval);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {isLocationLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.text, { color: theme.text }]}>{t.loading}</Text>
        </View>
      ) : (
        <>
          <View style={styles.mapContainer}>
            <WebView
              style={styles.map}
              source={{
                html: createMapHTML(currentLocation.latitude, currentLocation.longitude)
              }}
              javaScriptEnabled={true}
              onError={() => setHasError(true)}
            />
          </View>

          <View style={[styles.bottomContainer, { backgroundColor: theme.card }]}>
            {hasError && (
              <Text style={[styles.errorText, { color: theme.error }]}>
                {t.errorLoadingMap}
              </Text>
            )}
            <Text style={[styles.statusText, { color: theme.text }]}>
              {t.status}: {isWithinRange ? t.withinRange : t.outsideRange}
            </Text>
            
            {lastClockAction && (
              <Text style={[styles.statusText, { color: theme.text }]}>
                {lastClockAction}
              </Text>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.primary }]}
                onPress={() => handleClockAction('in')}
              >
                <Text style={styles.buttonText}>
                  {t.clockIn}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.primary }]}
                onPress={() => handleClockAction('out')}
              >
                <Text style={styles.buttonText}>
                  {t.clockOut}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
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
    marginTop: 10,
    paddingHorizontal: 10,
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
});

export default ATShowMap;
