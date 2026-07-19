import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  StyleSheet,
  BackHandler
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../src/context/ThemeContext';
import { ChevronLeft, MapPin, Search, Compass, ChevronRight } from 'lucide-react-native';
import { WebView } from 'react-native-webview';
import axios from 'axios';
import api from '../src/api/api';

export default function SelectLocationScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const webViewRef = useRef(null);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      const state = navigation.getState();
      const routes = state.routes;
      const prevRoute = routes[routes.length - 2]?.name;

      // If previous screen is auth-related, redirect to permission home base instead of re-asking OTP
      if (prevRoute === 'Otp' || prevRoute === 'Login' || prevRoute === 'GetStarted') {
        navigation.navigate('LocationPermission');
      } else {
        navigation.goBack();
      }
    } else {
      navigation.navigate('LocationPermission');
    }
  };

  useEffect(() => {
    const backAction = () => {
      handleBack();
      return true; // Intercept and block default OS back logic
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [navigation]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [storeSettings, setStoreSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // User location parameters
  const [latitude, setLatitude] = useState(13.0406); // Default: T. Nagar
  const [longitude, setLongitude] = useState(80.2337);
  const [addressText, setAddressText] = useState('T. Nagar, Chennai');

  // Delivery radius parameters
  const [distance, setDistance] = useState(0);
  const [isDeliverable, setIsDeliverable] = useState(true);

  // Fetch store operational settings on startup
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data.settings) {
          setStoreSettings(res.data.settings);
        }
      } catch (err) {
        console.log('Failed to fetch settings for map picker:', err.message);
      } finally {
        setLoadingSettings(false);
      }
    };
    fetchSettings();
  }, []);

  // Update distance checks dynamically
  useEffect(() => {
    if (!storeSettings) return;

    const calcDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Earth radius in KM
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const checkPointInPolygon = (point, polygon) => {
      const x = point[0], y = point[1];
      let inside = false;
      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i][0], yi = polygon[i][1];
        const xj = polygon[j][0], yj = polygon[j][1];
        const intersect = ((yi > y) !== (yj > y))
          && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
      }
      return inside;
    };

    const storeLat = storeSettings.storeLatitude || 13.0406;
    const storeLng = storeSettings.storeLongitude || 80.2337;

    const calculatedDist = calcDistance(storeLat, storeLng, latitude, longitude);
    setDistance(calculatedDist);

    if (storeSettings.zoneType === 'CIRCLE') {
      setIsDeliverable(calculatedDist <= (storeSettings.deliveryRadius || 5));
    } else {
      if (storeSettings.deliveryPolygon && storeSettings.deliveryPolygon.length >= 3) {
        setIsDeliverable(checkPointInPolygon([latitude, longitude], storeSettings.deliveryPolygon));
      } else {
        setIsDeliverable(true);
      }
    }
  }, [latitude, longitude, storeSettings]);

  const searchTimeout = useRef(null);

  // Handle autocomplete query triggers using OpenStreetMap Nominatim Search
  const handleAddressSearch = (text) => {
    console.log("text ", text);

    setSearchQuery(text);
    if (text.trim().length < 3) {
      setSearchResults([]);
      return;
    }
    console.log("11111111");

    if (searchTimeout.current) {
      console.log("22222222");

      clearTimeout(searchTimeout.current);
    }
    console.log("333333333333");

    setSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await axios.get('https://photon.komoot.io/api/', {
          params: {
            q: text,
            limit: 5,
            lat: 13.0827, // Bias search towards Chennai center coordinates
            lon: 80.2707
          }
        });

        const parsedResults = (res.data.features || []).map(feature => {
          const name = feature.properties.name || 'Unknown Address';
          const street = feature.properties.street ? feature.properties.street + ', ' : '';
          const city = feature.properties.city || '';
          const description = `${street}${city}`.trim() || feature.properties.country || 'Chennai';

          return {
            name: name,
            latitude: parseFloat(feature.geometry.coordinates[1]), // Photon coordinates are [longitude, latitude]
            longitude: parseFloat(feature.geometry.coordinates[0]),
            description: description
          };
        });

        setSearchResults(parsedResults);
      } catch (err) {
        console.log('Photon search request failed:', err.message);
      } finally {
        setSearching(false);
      }
    }, 500); // 500ms debounce delay
  };

  const handleSelectPreset = (preset) => {
    setLatitude(preset.latitude);
    setLongitude(preset.longitude);
    setAddressText(preset.name);
    setSearchQuery('');
    setSearchResults([]);

    // Teleport Leaflet Map center point
    const panMessage = JSON.stringify({
      type: 'PAN_TO',
      latitude: preset.latitude,
      longitude: preset.longitude
    });
    webViewRef.current?.postMessage(panMessage);
  };

  // Listen for message events posted from within the Leaflet WebView frame
  const handleMapMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'MOVE') {
        setLatitude(Number(data.latitude.toFixed(6)));
        setLongitude(Number(data.longitude.toFixed(6)));
        setAddressText('Map Selected Coordinates');
      }
    } catch (e) {
      console.log('Error decoding webview payload:', e);
    }
  };

  const handleConfirmLocation = () => {
    const coords = {
      latitude,
      longitude,
      addressText
    };
    navigation.replace('Home', { coords });
  };

  // Compile Leaflet script inside HTML file to load in WebView
  const getLeafletHtml = () => {
    if (!storeSettings) return '';
    const storeLat = storeSettings.storeLatitude || 13.0406;
    const storeLng = storeSettings.storeLongitude || 80.2337;
    const zoneType = storeSettings.zoneType || 'CIRCLE';
    const radiusMeters = (storeSettings.deliveryRadius || 5) * 1000;
    const polygonCoords = JSON.stringify(storeSettings.deliveryPolygon || []);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; background: #f8fafc; }
          #map { width: 100%; height: 100%; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map', { zoomControl: false }).setView([${latitude}, ${longitude}], 14);
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
          }).addTo(map);

          // Render Store Node marker
          var storeIcon = L.divIcon({
            html: "<div style='background-color:#10b981;width:12px;height:12px;border:2px solid white;border-radius:50%;box-shadow:0 0 10px rgba(16,185,129,0.5);'></div>",
            className: 'custom-icon',
            iconSize: [12, 12],
            iconAnchor: [6, 6]
          });
          L.marker([${storeLat}, ${storeLng}], { icon: storeIcon }).bindTooltip("Store base").addTo(map);

          // Render operational zone overlay
          if ('${zoneType}' === 'CIRCLE') {
            L.circle([${storeLat}, ${storeLng}], {
              radius: ${radiusMeters},
              color: '#10b981',
              fillColor: '#10b981',
              fillOpacity: 0.15,
              weight: 2
            }).addTo(map);
          } else {
            var polyCoords = ${polygonCoords};
            if (polyCoords.length >= 3) {
              L.polygon(polyCoords, {
                color: '#10b981',
                fillColor: '#10b981',
                fillOpacity: 0.15,
                weight: 2
              }).addTo(map);
            }
          }

          // User draggable target selector pin
          var userMarker = L.marker([${latitude}, ${longitude}], { draggable: true }).addTo(map);

          userMarker.on('dragend', function() {
            var latlng = userMarker.getLatLng();
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'MOVE',
              latitude: latlng.lat,
              longitude: latlng.lng
            }));
          });

          map.on('click', function(e) {
            var latlng = e.latlng;
            userMarker.setLatLng(latlng);
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'MOVE',
              latitude: latlng.lat,
              longitude: latlng.lng
            }));
          });

          // Teleport listener
          window.addEventListener('message', function(event) {
            try {
              var data = JSON.parse(event.data);
              if (data.type === 'PAN_TO') {
                var pos = [data.latitude, data.longitude];
                userMarker.setLatLng(pos);
                map.panTo(pos);
              }
            } catch(e) {}
          });
        </script>
      </body>
      </html>
    `;
  };

  if (loadingSettings) {
    return (
      <View style={{ flex: 1, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />

      {/* Header */}
      <View
        style={{ borderBottomColor: colors.border }}
        className="px-5 py-4 border-b flex-row items-center bg-white"
      >
        <TouchableOpacity
          onPress={handleBack}
          className="p-1 rounded-full mr-3"
        >
          <ChevronLeft size={24} color={colors.textMain} />
        </TouchableOpacity>
        <Text style={{ color: colors.textMain }} className="text-lg font-black">Select Delivery Location</Text>
      </View>

      <View className="flex-1 p-5 relative">

        {/* Real Address Autocomplete Search Input */}
        <View style={{ backgroundColor: colors.card, borderColor: colors.border }} className="flex-row items-center px-4 py-3.5 rounded-2xl border mb-4 z-20 shadow-sm">
          <Search size={18} color={colors.textMuted} className="mr-3" />
          <TextInput
            placeholder="Search address, mall, or street..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={handleAddressSearch}
            className="flex-1 text-sm font-bold text-slate-800 p-0"
          />
          {searching && <ActivityIndicator color={colors.primary} size="small" />}
        </View>

        {/* Dropdown list of Nominatim search recommendations */}
        {searchResults.length > 0 ? (
          <View style={{ borderColor: colors.border, flex: 1 }} className="border rounded-2xl overflow-hidden bg-slate-50 shadow-sm mb-4">
            <ScrollView keyboardShouldPersistTaps="handled">
              {searchResults.map((preset, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => handleSelectPreset(preset)}
                  style={{ borderBottomColor: colors.border }}
                  className="px-4 py-4 flex-row items-center justify-between border-b"
                >
                  <View className="flex-row items-center flex-1 mr-2">
                    <MapPin size={18} color={colors.primary} className="mr-3" />
                    <View className="flex-1">
                      <Text style={{ color: colors.textMain }} className="text-sm font-black">{preset.name}</Text>
                      <Text style={{ color: colors.textMuted }} className="text-[11px] font-bold mt-1 capitalize">{preset.description}</Text>
                    </View>
                  </View>
                  <ChevronRight size={16} color={colors.textMuted} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : (
          <>
            {/* Interactive Map Visualizer Container (WebView) */}
            <View className="flex-1 w-full rounded-[32px] overflow-hidden border border-slate-100 mb-5 relative bg-slate-50 z-10 shadow-sm">
              <WebView
                ref={webViewRef}
                originWhitelist={['*']}
                source={{ html: getLeafletHtml() }}
                onMessage={handleMapMessage}
                className="flex-1 w-full"
                style={{ backgroundColor: 'transparent' }}
              />

              {/* Centered target pin overlay reference */}
              <View className="absolute inset-0 items-center justify-center pointer-events-none opacity-40">
                <Compass size={24} color={colors.primary} />
              </View>
            </View>

            {/* Status/Details overlay panel */}
            <View style={{ borderColor: colors.border, backgroundColor: colors.card }} className="border rounded-2xl p-4 mb-4">
              <Text style={{ color: colors.textMain }} className="text-xs font-black truncate mb-2.5">
                📍 {addressText}
              </Text>

              <View
                style={{
                  borderColor: isDeliverable ? '#10b981' : '#ef4444',
                  backgroundColor: isDeliverable ? '#ecfdf5' : '#fef2f2'
                }}
                className="w-full border rounded-xl px-3 py-2.5 flex-row items-center justify-between"
              >
                <Text style={{ color: isDeliverable ? '#059669' : '#dc2626' }} className="text-xs font-black">
                  {isDeliverable ? '🟢 Delivery Available' : '🔴 Outside Delivery Zone'}
                </Text>
                <Text style={{ color: isDeliverable ? '#059669' : '#dc2626' }} className="text-[10px] font-bold">
                  {distance.toFixed(1)} KM from store
                </Text>
              </View>
            </View>

            {/* Confirm Selection Action Button */}
            <TouchableOpacity
              onPress={handleConfirmLocation}
              style={{
                backgroundColor: isDeliverable ? colors.primary : '#94a3b8',
                shadowColor: colors.primary
              }}
              disabled={!isDeliverable}
              className="w-full rounded-2xl py-4.5 items-center justify-center shadow-md shadow-emerald-700/20 mb-2 z-10"
            >
              <Text className="text-white font-extrabold text-base">Confirm & Select Location</Text>
            </TouchableOpacity>
          </>
        )}

      </View>
    </SafeAreaView>
  );
}
