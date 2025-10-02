export default {
  expo: {
    name: "TaskMaster",
    slug: "TaskMaster",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/mainicon.png",
    scheme: "onlyclicktaskmaster",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/mainicon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/mainicon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      package: "com.onlyclick.serviceprovider",
      permissions: [
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION",
      ],
      compileSdkVersion: 35,
      targetSdkVersion: 35,
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/mainicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission:
            "This app needs access to your location to show nearby services and providers.",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: "fb41cc19-ffd6-495c-a77a-94f9b77a86db",
      },
      // Environment variables for the app
      expoPublicSupabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      expoPublicSupabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      expoPublicApiUrl: process.env.EXPO_PUBLIC_API_URL,
    },
  },
};
