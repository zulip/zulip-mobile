import { NativeModules } from 'react-native';
import DeviceInfo from 'react-native-device-info';

const userAgent = NativeModules.RNDeviceInfo ? `ZulipMobile ${DeviceInfo.getVersion()} (${DeviceInfo.getSystemName()} ${DeviceInfo.getSystemVersion()})` : '';

export default userAgent;
