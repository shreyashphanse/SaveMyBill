import Constants from "expo-constants";
import { Platform } from "react-native";

// Get debugger host (works for both new + old Expo projects)
const debuggerHost =
  Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;

const devHost = Platform.select({
  ios: debuggerHost?.split(":").shift(),
  android: debuggerHost?.split(":").shift(),
});

const fallbackHost = "192.168.117.24";

const host = devHost || fallbackHost;
// const host = fallbackHost || devHost;

export const API_BASE_URL = `https://savemybill-backend.onrender.com`;
export const OCR_BASE_URL = `http://${host}:5001`;
export const PIE_BASE_URL = `http://${host}:5002`;
