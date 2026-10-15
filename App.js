import "./global.css";
import React, { useState } from "react";
import { View, TouchableOpacity, Modal, StyleSheet } from "react-native";
import Text from "./components/AppText";
import NetworkLogger from "react-native-network-logger";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeProvider } from "./src/context/ThemeContext";
import { CartProvider } from "./src/context/CartContext";
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import screens
import SplashScreen from "./screens/SplashScreen";
import GetStartedScreen from "./screens/GetStartedScreen";
import LoginScreen from "./screens/LoginScreen";
import OtpScreen from "./screens/OtpScreen";
import LocationPermissionScreen from "./screens/LocationPermissionScreen";
import HomeScreen from "./screens/HomeScreen";
import ProductListingScreen from "./screens/ProductListingScreen";
import ProductDetailsScreen from "./screens/ProductDetailsScreen";
import CheckoutScreen from "./screens/CheckoutScreen";
import OrderSuccessScreen from "./screens/OrderSuccessScreen";
import TrackingScreen from "./screens/TrackingScreen";
import AddressScreen from "./screens/AddressScreen";
import NoInternetScreen from "./screens/NoInternetScreen";
import ShopClosedScreen from "./screens/ShopClosedScreen";
import OutsideRadiusScreen from "./screens/OutsideRadiusScreen";
import MaintenanceScreen from "./screens/MaintenanceScreen";
import SelectLocationScreen from "./screens/SelectLocationScreen";
import SearchScreen from "./screens/SearchScreen";
import ProfileScreen from "./screens/ProfileScreen";

const Stack = createStackNavigator();

export default function App() {
  const [showNetworkLogger, setShowNetworkLogger] = useState(false);

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <CartProvider>
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
                animationEnabled: true,
                gestureEnabled: true,
                cardStyle: { backgroundColor: "white" },
              }}
            >
              <Stack.Screen options={{ animation: "none" }} name="Splash" component={SplashScreen} />
              <Stack.Screen options={{ animation: "fade" }} name="GetStarted" component={GetStartedScreen} />
              <Stack.Screen options={{ animation: "fade" }} name="Login" component={LoginScreen} />
              <Stack.Screen options={{ animation: "fade" }} name="Otp" component={OtpScreen} />
              <Stack.Screen options={{ animation: "fade" }} name="LocationPermission" component={LocationPermissionScreen} />
              <Stack.Screen options={{ animation: "fade" }} name="Home" component={HomeScreen} />
              <Stack.Screen options={{ animation: "fade" }} name="ProductListing" component={ProductListingScreen} />
              <Stack.Screen options={{ animation: "fade" }} name="ProductDetails" component={ProductDetailsScreen} />
              <Stack.Screen options={{ animation: "fade" }} name="Checkout" component={CheckoutScreen} />
              <Stack.Screen options={{ animation: "fade" }} name="Address" component={AddressScreen} />
              <Stack.Screen options={{ animation: "fade" }} name="OrderSuccess" component={OrderSuccessScreen} />
              <Stack.Screen options={{ animation: "fade" }} name="Tracking" component={TrackingScreen} />
              <Stack.Screen options={{ animation: "fade" }} name="NoInternet" component={NoInternetScreen} />
              <Stack.Screen options={{ animation: "fade" }} name="ShopClosed" component={ShopClosedScreen} />
              <Stack.Screen options={{ animation: "fade" }} name="OutsideRadius" component={OutsideRadiusScreen} />
              <Stack.Screen options={{ animation: "fade" }} name="Maintenance" component={MaintenanceScreen} />
              <Stack.Screen options={{ animation: "fade" }} name="SelectLocation" component={SelectLocationScreen} />
              <Stack.Screen options={{ animation: "fade" }} name="Search" component={SearchScreen} />
              <Stack.Screen options={{ animation: "fade" }} name="Profile" component={ProfileScreen} />
            </Stack.Navigator>
          </CartProvider>
        </NavigationContainer>

        {__DEV__ && (
          <>
            <TouchableOpacity
              style={styles.floatingLoggerBtn}
              onPress={() => setShowNetworkLogger(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.loggerBtnText}>🌐 Network</Text>
            </TouchableOpacity>

            <Modal visible={showNetworkLogger} animationType="slide">
              <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
                <View style={styles.loggerHeader}>
                  <Text style={styles.loggerTitle}>In-App Network Inspector</Text>
                  <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={() => setShowNetworkLogger(false)}
                  >
                    <Text style={styles.closeBtnText}>✕ Close</Text>
                  </TouchableOpacity>
                </View>
                <NetworkLogger theme="dark" />
              </View>
            </Modal>
          </>
        )}
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  floatingLoggerBtn: {
    position: 'absolute',
    top: 60,
    right: 15,
    backgroundColor: '#000000e0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    zIndex: 99999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  loggerBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loggerHeader: {
    height: 54,
    backgroundColor: '#1e293b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  loggerTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeBtn: {
    backgroundColor: '#ef4444',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  closeBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
});