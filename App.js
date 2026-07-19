import "./global.css";
import React from "react";
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

const Stack = createStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <SafeAreaProvider>
          <NavigationContainer>
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
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
      </CartProvider>
    </ThemeProvider>
  );
}