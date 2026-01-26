
interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  platform: "web" | "android" | "ios";
}

export const getDeviceInfo = (): DeviceInfo => {
  // 1. Get or create persistent Device ID
  let deviceId = "";
  
  if (typeof window !== "undefined") {
    deviceId = localStorage.getItem("deviceId") || "";
    if (!deviceId) {
      // Use crypto.randomUUID if available, else fallback to random string
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        deviceId = crypto.randomUUID();
      } else {
        deviceId = 'device-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      }
      localStorage.setItem("deviceId", deviceId);
    }
  }

  // 2. Detect Platform and Name
  let platform: "web" | "android" | "ios" = "web";
  let deviceName = "Unknown Device";

  if (typeof navigator !== "undefined") {
    const userAgent = navigator.userAgent;

    if (/android/i.test(userAgent)) {
      platform = "android";
      deviceName = "Android Device";
    } else if (/iPad|iPhone|iPod/.test(userAgent)) {
      platform = "ios";
      deviceName = "iOS Device";
    } else {
      platform = "web";
      // Try to guess browser name
      if (userAgent.indexOf("Chrome") > -1) {
        deviceName = "Chrome Web";
      } else if (userAgent.indexOf("Safari") > -1) {
        deviceName = "Safari Web";
      } else if (userAgent.indexOf("Firefox") > -1) {
        deviceName = "Firefox Web";
      } else {
        deviceName = "Web Browser";
      }
    }
  }

  return {
    deviceId,
    deviceName,
    platform,
  };
};
