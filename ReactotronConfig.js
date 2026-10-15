import Reactotron from 'reactotron-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const reactotron = Reactotron
  .setAsyncStorageHandler(AsyncStorage)
  .configure({ name: 'FreshmartCustomer' })
  .useReactNative()
  .connect();

export default reactotron;
