import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
  ActivityIndicator,
  Alert,
  BackHandler
} from 'react-native';
import Text from '../components/AppText';
import TextInput from '../components/AppTextInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../src/context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {
  ChevronLeft,
  MapPin,
  Plus,
  Check,
  Home,
  Briefcase,
  Compass,
  Trash2,
  X,
  Navigation,
  Sparkles,
  Phone,
  User,
  Edit2
} from 'lucide-react-native';

const DEFAULT_ADDRESSES = [
  {
    id: 'addr-1',
    type: 'HOME',
    title: 'Home',
    receiverName: 'Shakthi',
    phone: '98765 43210',
    houseNo: 'Flat 402, B-Block',
    street: 'Green Valley Apartments, Anna Nagar',
    city: 'Chennai',
    pincode: '600040',
    latitude: 13.0406,
    longitude: 80.2337,
    isDefault: true
  },
  {
    id: 'addr-2',
    type: 'WORK',
    title: 'Work',
    receiverName: 'Shakthi',
    phone: '98765 43210',
    houseNo: 'Suite 120, 3rd Floor',
    street: 'TTK Tech Park, T. Nagar',
    city: 'Chennai',
    pincode: '600017',
    latitude: 13.0418,
    longitude: 80.2341,
    isDefault: false
  }
];

export default function AddressScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  };

  useEffect(() => {
    const backAction = () => {
      handleBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [navigation]);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('addr-1');
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Modal State
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  // Form Inputs
  const [formType, setFormType] = useState('HOME');
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formHouseNo, setFormHouseNo] = useState('');
  const [formStreet, setFormStreet] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formPincode, setFormPincode] = useState('');
  const [formLat, setFormLat] = useState(13.0406);
  const [formLng, setFormLng] = useState(80.2337);

  // Load addresses on mount & listen for map picker return
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const stored = await AsyncStorage.getItem('savedAddresses');
        if (stored) {
          const parsed = JSON.parse(stored);
          setAddresses(parsed);
          const def = parsed.find(a => a.isDefault);
          if (def) setSelectedAddressId(def.id);
        } else {
          setAddresses(DEFAULT_ADDRESSES);
          await AsyncStorage.setItem('savedAddresses', JSON.stringify(DEFAULT_ADDRESSES));
        }
      } catch (err) {
        console.log('Error loading saved addresses:', err);
        setAddresses(DEFAULT_ADDRESSES);
      }
    };
    loadAddresses();
  }, []);

  // Handle address returned from SelectLocationScreen map picker
  useEffect(() => {
    if (route.params?.selectedAddressFromMap) {
      const selected = route.params.selectedAddressFromMap;
      setFormType('HOME');
      setFormName('Shakthi');
      setFormPhone('98765 43210');
      setFormHouseNo('Door No. 1');
      setFormStreet(selected.street || selected.addressText || 'Selected Street Location');
      setFormCity(selected.city || 'Chennai');
      setFormPincode(selected.pincode || '600040');
      setFormLat(selected.latitude || 13.0406);
      setFormLng(selected.longitude || 80.2337);
      setEditingAddressId(null);
      setShowAddressModal(true);
    }
  }, [route.params?.selectedAddressFromMap]);

  const saveAddressesToStorage = async (updatedList) => {
    const listToSave = updatedList || [];
    setAddresses(listToSave);
    try {
      await AsyncStorage.setItem('savedAddresses', JSON.stringify(listToSave));
    } catch (err) {
      console.log('Error saving addresses:', err);
    }
  };

  const handleSelectAddress = async (addr) => {
    console.log("addr ", addr);

    try {
      if (!addr || !addr.id) return;

      // 1. Update active selection ID and default flag in state
      setSelectedAddressId(addr.id);
      console.log("///////////");

      // const updated = (addresses || []).map(a => ({
      //   ...a,
      //   isDefault: a?.id === addr.id
      // }));
      // console.log("2222222222");

      // // 2. Persist updated default status to AsyncStorage
      // // await saveAddressesToStorage(updated);
      // console.log("3333333333");

      // // 3. Format complete address text string
      // const house = addr.houseNo ? `${addr.houseNo}, ` : '';
      // const street = addr.street || 'Anna Nagar';
      // const city = addr.city || 'Chennai';
      // const fullAddressText = `${house}${street}, ${city}`;

      // const coords = {
      //   latitude: Number(addr.latitude) || 13.0406,
      //   longitude: Number(addr.longitude) || 80.2337,
      //   addressText: fullAddressText,
      //   selectedAddress: addr
      // };
      // console.log("44444444444");

      // 4. Return safely to calling screen (Home or Checkout)
      // if (route.params?.returnScreen || route.params?.fromCart || route.params?.fromCheckout) {
      //   const isFromCheckout = route.params?.fromCheckout || route.params?.returnScreen === 'Checkout';
      //   const targetScreen = isFromCheckout ? 'Checkout' : 'Home';
      //   console.log("55555555555555");

      //   try {
      //     console.log("6666666");

      //     navigation.navigate(targetScreen, { selectedAddress: addr, coords });
      //   } catch (navErr) {
      //     console.log("77777");

      //     if (navigation.canGoBack()) {
      //       console.log("888888888");

      //       navigation.goBack();
      //     } else {
      //       console.log("99999999999");

      //       navigation.navigate('Home', { selectedAddress: addr, coords });
      //     }
      //   }
      // } else {
      //   if (navigation.canGoBack()) {
      //     navigation.goBack();
      //   } else {
      //     navigation.navigate('Home', { selectedAddress: addr, coords });
      //   }
      // }
    } catch (err) {
      console.log('Error selecting address safely:', err.message);
    }
  };

  // Open interactive Leaflet Map Picker
  const openMapPicker = () => {
    navigation.navigate('SelectLocation', { returnToAddressScreen: true });
  };

  // GPS Current Location Detection
  const handleDetectGPSLocation = async () => {
    setDetectingLocation(true);
    try {
      const lat = 13.0406;
      const lon = 80.2337;

      const res = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
        { headers: { 'User-Agent': 'FreshMartCustomerApp/1.0' } }
      );

      const addressData = res.data?.address || {};
      const streetName = addressData.road || addressData.suburb || addressData.neighbourhood || 'Anna Nagar 3rd Main Rd';
      const cityName = addressData.city || addressData.county || 'Chennai';
      const postcode = addressData.postcode || '600040';

      setFormType('HOME');
      setFormName('Shakthi');
      setFormPhone('98765 43210');
      setFormHouseNo('Door No. 12/A');
      setFormStreet(streetName);
      setFormCity(cityName);
      setFormPincode(postcode);
      setFormLat(lat);
      setFormLng(lon);

      setEditingAddressId(null);
      setShowAddressModal(true);
    } catch (err) {
      console.log('Reverse geocoding error:', err.message);
      // Fallback auto fill
      setFormType('HOME');
      setFormName('Shakthi');
      setFormPhone('98765 43210');
      setFormHouseNo('Door No. 12/A');
      setFormStreet('Anna Nagar West 2nd Street');
      setFormCity('Chennai');
      setFormPincode('600040');
      setEditingAddressId(null);
      setShowAddressModal(true);
    } finally {
      setDetectingLocation(false);
    }
  };

  const openAddModal = () => {
    // Open interactive Leaflet map picker directly for zero manual entry effort
    openMapPicker();
  };

  const openEditModal = (addr) => {
    setEditingAddressId(addr.id);
    setFormType(addr.type || 'HOME');
    setFormName(addr.receiverName || '');
    setFormPhone(addr.phone || '');
    setFormHouseNo(addr.houseNo || '');
    setFormStreet(addr.street || '');
    setFormCity(addr.city || 'Chennai');
    setFormPincode(addr.pincode || '');
    setFormLat(addr.latitude || 13.0406);
    setFormLng(addr.longitude || 80.2337);
    setShowAddressModal(true);
  };

  const handleDeleteAddress = (id) => {
    if (addresses.length <= 1) {
      Alert.alert('Cannot Delete', 'You must have at least one saved delivery address.');
      return;
    }
    const filtered = addresses.filter(a => a.id !== id);
    if (selectedAddressId === id && filtered.length > 0) {
      filtered[0].isDefault = true;
      setSelectedAddressId(filtered[0].id);
    }
    saveAddressesToStorage(filtered);
  };

  const handleSaveAddressForm = () => {
    const houseNoToSave = formHouseNo.trim() || 'Door No. 1';
    const streetToSave = formStreet.trim() || 'Selected Location';

    if (editingAddressId) {
      // Update existing
      const updated = addresses.map(a => {
        if (a.id === editingAddressId) {
          return {
            ...a,
            type: formType,
            title: formType === 'HOME' ? 'Home' : formType === 'WORK' ? 'Work' : 'Other',
            receiverName: formName || 'Shakthi',
            phone: formPhone || '98765 43210',
            houseNo: houseNoToSave,
            street: streetToSave,
            city: formCity || 'Chennai',
            pincode: formPincode || '600040',
            latitude: formLat,
            longitude: formLng
          };
        }
        return a;
      });
      saveAddressesToStorage(updated);
    } else {
      // Add new
      const newAddr = {
        id: `addr-${Date.now()}`,
        type: formType,
        title: formType === 'HOME' ? 'Home' : formType === 'WORK' ? 'Work' : 'Other',
        receiverName: formName || 'Shakthi',
        phone: formPhone || '98765 43210',
        houseNo: houseNoToSave,
        street: streetToSave,
        city: formCity || 'Chennai',
        pincode: formPincode || '600040',
        latitude: formLat,
        longitude: formLng,
        isDefault: true
      };
      const updated = addresses.map(a => ({ ...a, isDefault: false }));
      updated.push(newAddr);
      setSelectedAddressId(newAddr.id);
      saveAddressesToStorage(updated);
    }

    setShowAddressModal(false);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'HOME':
        return <Home size={18} color={colors.primary} />;
      case 'WORK':
        return <Briefcase size={18} color="#2563eb" />;
      default:
        return <MapPin size={18} color="#9333ea" />;
    }
  };

  const getTypeBadgeStyle = (type) => {
    switch (type) {
      case 'HOME':
        return { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' };
      case 'WORK':
        return { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' };
      default:
        return { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700' };
    }
  };
  console.log("addresses", addresses);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8faf9' }}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />

      {/* Header bar */}
      <View className="px-5 py-4 bg-white border-b border-slate-100 flex-row items-center justify-between shadow-xs">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={handleBack}
            activeOpacity={0.7}
            className="p-2 rounded-2xl bg-slate-100 items-center justify-center mr-1"
          >
            <ChevronLeft size={22} color={colors.textMain} />
          </TouchableOpacity>
          <View>
            <Text style={{ color: colors.textMain }} className="text-xl font-black tracking-tight">
              Saved Addresses
            </Text>
            <Text style={{ color: colors.textMuted }} className="text-xs font-bold">
              {addresses.length} saved location{addresses.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={openAddModal}
          style={{ backgroundColor: colors.primary }}
          className="flex-row items-center gap-1.5 px-3.5 py-2 rounded-2xl shadow-sm"
        >
          <Plus size={16} color="white" />
          <Text className="text-white text-xs font-black">Add New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-5 pt-4 space-y-4">
        {/* Addresses List Header */}
        <View className="flex-row items-center justify-between pb-2">
          <Text style={{ color: colors.textMain }} className="text-xs font-black uppercase tracking-wider">
            Select Delivery Location
          </Text>
        </View>

        {/* Saved Addresses Cards */}
        {addresses.map((addr) => {
          const isSelected = selectedAddressId === addr.id;
          console.log("isSelected ", isSelected);

          const badge = getTypeBadgeStyle(addr.type);

          return (
            <TouchableOpacity
              key={addr.id}
              activeOpacity={0.9}
              onPress={() => handleSelectAddress(addr)}
              className={`p-5 rounded-3xl border-2 transition-all mb-3 ${isSelected
                ? 'bg-white border-emerald-500 shadow-md'
                : 'bg-white border-slate-100 shadow-xs'
                }`}
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-row items-start gap-3 flex-1 pr-3">
                  <View className={`w-10 h-10 rounded-2xl items-center justify-center border ${badge.bg}`}>
                    {getTypeIcon(addr.type)}
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text style={{ color: colors.textMain }} className="text-base font-black">
                        {addr.title || addr.type}
                      </Text>
                      {isSelected && (
                        <View className="bg-emerald-500 px-2 py-0.5 rounded-full">
                          <Text className="text-white text-[9px] font-black uppercase">DEFAULT</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-slate-700 text-xs font-bold mt-1 leading-snug">
                      {addr.houseNo}, {addr.street}
                    </Text>
                    <Text className="text-slate-400 text-xs font-medium mt-0.5">
                      {addr.city} - {addr.pincode}
                    </Text>
                    {addr.phone && (
                      <View className="flex-row items-center gap-1 mt-2">
                        <Phone size={12} color="#64748b" />
                        <Text className="text-slate-500 text-[11px] font-semibold">
                          {addr.receiverName || 'Contact'}: {addr.phone}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Selected Radio Badge */}
                <View
                  className={`w-6 h-6 rounded-full border-2 items-center justify-center ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 bg-transparent'
                    }`}
                >
                  {isSelected && <Check size={14} color="white" className="stroke-[3]" />}
                </View>
              </View>

              {/* Action Buttons (Edit & Delete) */}
              <View className="flex-row items-center justify-end gap-3 pt-3 mt-3 border-t border-slate-100">
                <TouchableOpacity
                  onPress={() => openEditModal(addr)}
                  className="flex-row items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-xl"
                >
                  <Edit2 size={13} color="#475569" />
                  <Text className="text-slate-600 text-xs font-bold">Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleDeleteAddress(addr.id)}
                  className="flex-row items-center gap-1.5 px-3 py-1.5 bg-red-50 rounded-xl border border-red-100"
                >
                  <Trash2 size={13} color="#ef4444" />
                  <Text className="text-red-500 text-xs font-bold">Delete</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Dash Border Add Address Trigger Card */}
        <TouchableOpacity
          onPress={openAddModal}
          className="border-2 border-dashed border-emerald-300 bg-emerald-50/40 rounded-3xl p-6 items-center justify-center mb-8 gap-2"
        >
          <View className="w-12 h-12 rounded-full bg-emerald-500 items-center justify-center shadow-sm">
            <Plus size={24} color="white" />
          </View>
          <Text style={{ color: colors.primary }} className="text-sm font-black">
            + Pick Address on Map
          </Text>
          <Text className="text-slate-400 text-xs font-medium text-center">
            Select pin on map to auto-extract street, city and pincode
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add / Edit Address Drawer Modal */}
      <Modal
        visible={showAddressModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddressModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[32px] p-6 max-h-[85%] border-t border-slate-100 shadow-2xl">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <View className="flex-row items-center gap-2.5">
                <View style={{ backgroundColor: colors.primaryLight }} className="p-2.5 rounded-2xl">
                  <MapPin size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={{ color: colors.textMain }} className="text-lg font-black">
                    {editingAddressId ? 'Edit Delivery Address' : 'Confirm Location Address'}
                  </Text>
                  <Text style={{ color: colors.textMuted }} className="text-xs font-semibold">
                    Derived automatically from Map / GPS
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setShowAddressModal(false)}
                className="w-9 h-9 bg-slate-100 rounded-full items-center justify-center"
              >
                <X size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="py-2">
              {/* Map Location Badge & Re-pick trigger */}
              <View style={{ marginBottom: 16 }} className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex-row items-center justify-between">
                <View className="flex-row items-center gap-2.5 flex-1 pr-2">
                  <Compass size={18} color={colors.primary} />
                  <View className="flex-1">
                    <Text className="text-emerald-900 text-xs font-black">Location Pin Coordinates</Text>
                    <Text className="text-emerald-700 text-[11px] font-bold truncate">
                      {formStreet ? `${formStreet}, ${formCity}` : 'Pin set on Map'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setShowAddressModal(false);
                    openMapPicker();
                  }}
                  className="bg-emerald-600 px-3 py-1.5 rounded-xl flex-row items-center gap-1 shadow-xs"
                >
                  <MapPin size={12} color="white" />
                  <Text className="text-white text-[11px] font-black">Change Pin</Text>
                </TouchableOpacity>
              </View>

              {/* Category Pills (HOME, WORK, OTHER) */}
              <View style={{ marginBottom: 16 }}>
                <Text className="text-slate-400 text-[10px] font-extrabold uppercase mb-2">Save Address As</Text>
                <View className="flex-row gap-3">
                  {[
                    { key: 'HOME', label: 'Home', icon: Home },
                    { key: 'WORK', label: 'Work', icon: Briefcase },
                    { key: 'OTHER', label: 'Other', icon: MapPin }
                  ].map((tag) => {
                    const TagIcon = tag.icon;
                    const isSel = formType === tag.key;
                    return (
                      <TouchableOpacity
                        key={tag.key}
                        onPress={() => setFormType(tag.key)}
                        style={{
                          backgroundColor: isSel ? colors.primary : '#f1f5f9',
                          borderColor: isSel ? colors.primary : '#e2e8f0'
                        }}
                        className="px-4 py-2.5 rounded-2xl border flex-row items-center gap-2 flex-1 justify-center shadow-xs"
                      >
                        <TagIcon size={16} color={isSel ? 'white' : '#64748b'} />
                        <Text className={`text-xs font-extrabold ${isSel ? 'text-white' : 'text-slate-600'}`}>
                          {tag.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Form Input: Receiver Name & Phone */}
              <View style={{ marginBottom: 14 }} className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-slate-600 text-xs font-black mb-1.5">Receiver Name</Text>
                  <TextInput
                    placeholder="e.g. Shakthi"
                    placeholderTextColor="#94a3b8"
                    value={formName}
                    onChangeText={setFormName}
                    className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-slate-600 text-xs font-black mb-1.5">Contact Phone</Text>
                  <TextInput
                    placeholder="e.g. 9876543210"
                    placeholderTextColor="#94a3b8"
                    keyboardType="phone-pad"
                    value={formPhone}
                    onChangeText={setFormPhone}
                    className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800"
                  />
                </View>
              </View>

              {/* Form Input: House / Flat No */}
              <View style={{ marginBottom: 14 }}>
                <Text className="text-slate-600 text-xs font-black mb-1.5">House / Flat / Building No (Optional)</Text>
                <TextInput
                  placeholder="Door No. 1"
                  placeholderTextColor="#94a3b8"
                  value={formHouseNo}
                  onChangeText={setFormHouseNo}
                  className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800"
                />
              </View>

              {/* Form Input: Street / Area */}
              <View style={{ marginBottom: 14 }}>
                <Text className="text-slate-600 text-xs font-black mb-1.5">Street / Area (Auto-Filled from Map)</Text>
                <TextInput
                  placeholder="e.g. 3rd Main Road, Anna Nagar"
                  placeholderTextColor="#94a3b8"
                  value={formStreet}
                  onChangeText={setFormStreet}
                  className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800"
                />
              </View>

              {/* Form Input: City & Pincode */}
              <View style={{ marginBottom: 10 }} className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-slate-600 text-xs font-black mb-1.5">City</Text>
                  <TextInput
                    placeholder="Chennai"
                    placeholderTextColor="#94a3b8"
                    value={formCity}
                    onChangeText={setFormCity}
                    className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-slate-600 text-xs font-black mb-1.5">Pincode</Text>
                  <TextInput
                    placeholder="600040"
                    placeholderTextColor="#94a3b8"
                    keyboardType="number-pad"
                    value={formPincode}
                    onChangeText={setFormPincode}
                    className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800"
                  />
                </View>
              </View>
            </ScrollView>

            {/* Save Button */}
            <View className="pt-4 mt-2 border-t border-slate-100">
              <TouchableOpacity
                onPress={handleSaveAddressForm}
                style={{ backgroundColor: colors.primary }}
                className="w-full py-4 rounded-2xl items-center justify-center shadow-lg shadow-emerald-700/25"
              >
                <Text className="text-white font-black text-sm">
                  {editingAddressId ? 'Save Changes' : 'Save & Select Address'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
