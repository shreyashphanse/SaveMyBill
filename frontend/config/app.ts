import Constants from "expo-constants";
import { Platform } from "react-native";

// Get debugger host (works for both new + old Expo projects)
const debuggerHost =
  Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;

const devHost = Platform.select({
  ios: debuggerHost?.split(":").shift(),
  android: debuggerHost?.split(":").shift(),
});

const fallbackHost = "10.151.103.24";

const host = devHost || fallbackHost;

export const API_BASE_URL = `http://${host}:5000`;
export const OCR_BASE_URL = `http://${host}:5001`;
export const PIE_BASE_URL = `http://${host}:5002`;
