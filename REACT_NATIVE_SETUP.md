# React Native/Expo Setup for MediVoice Records Mobile App

Build iOS and Android versions of MediVoice Records using Expo.

## Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI installed: `npm install -g expo-cli`
- iOS: Xcode (macOS only) or EAS Cloud Build
- Android: Android Studio or EAS Cloud Build
- Expo account: [expo.dev](https://expo.dev)

## Step 1: Create Expo Project

```bash
# Navigate to your workspace
cd /Users/talend/Desktop

# Create a new Expo project
expo init medivoice-mobile --template expo-template-blank-typescript

# OR create from existing web project using Monorepo approach
cd medivoice-mobile
```

## Step 2: Project Structure

```
medivoice-mobile/
├── app/
│   ├── _layout.tsx          # Navigation layout
│   ├── index.tsx            # Home screen
│   ├── (tabs)/              # Tabbed navigation
│   │   ├── dashboard.tsx
│   │   ├── patients.tsx
│   │   ├── reminders.tsx
│   │   └── settings.tsx
│   └── recording/
│       └── encounter.tsx
├── components/
│   ├── AudioRecorder.tsx     # Audio recording component
│   ├── PatientForm.tsx
│   ├── ReminderList.tsx
│   └── common/
├── lib/
│   ├── api.ts               # API client
│   ├── types.ts             # Shared types
│   └── storage.ts           # Local storage
├── hooks/
│   ├── useAudioRecording.ts
│   ├── useReminders.ts
│   └── usePatients.ts
├── services/
│   ├── supabase.ts
│   ├── audio.ts
│   └── notifications.ts
├── app.json
├── package.json
└── tsconfig.json
```

## Step 3: Install Dependencies

```bash
cd medivoice-mobile

# Core dependencies
npm install expo-router expo-status-bar expo-splash-screen
npm install react-native react-native-safe-area-context react-native-screens

# For audio recording
npm install expo-audio expo-av expo-file-system

# For notifications
npm install expo-notifications expo-device

# For device info
npm install expo-device expo-constants

# For camera (optional, for future video)
npm install expo-camera expo-image-picker

# UI & Navigation
npm install @react-navigation/native @react-navigation/bottom-tabs
npm install nativewind tailwindcss
npm install react-native-svg

# Backend
npm install @supabase/supabase-js

# State management
npm install zustand

# Date handling
npm install date-fns

# HTTP client
npm install axios

# Form handling
npm install react-hook-form
```

## Step 4: Configure app.json

Create/Update `app.json`:

```json
{
  "expo": {
    "name": "MediVoice Records",
    "slug": "medivoice-records",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTabletMode": true,
      "bundleIdentifier": "com.medivoice.records",
      "infoPlist": {
        "NSMicrophoneUsageDescription": "We need access to your microphone to record medical consultations.",
        "NSLocalNetworkUsageDescription": "We use local network to sync data.",
        "NSBonjourServiceTypes": ["_medivoice._tcp"]
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.medivoice.records",
      "permissions": [
        "RECORD_AUDIO",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "INTERNET",
        "ACCESS_NETWORK_STATE"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      [
        "expo-audio",
        {
          "microphonePermission": "We need access to your microphone to record consultations."
        }
      ],
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff"
        }
      ],
      [
        "expo-camera",
        {
          "cameraPermission": "We need camera access for future features."
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

## Step 5: Create API Client

Create `lib/api.ts`:

```typescript
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error retrieving token:', error);
  }
  return config;
});

// Patients API
export const patientsAPI = {
  list: () => api.get('/patients'),
  create: (data: any) => api.post('/patients', data),
  get: (id: string) => api.get(`/patients/${id}`),
  update: (id: string, data: any) => api.patch(`/patients/${id}`, data),
};

// Encounters API
export const encountersAPI = {
  list: (patientId: string) => api.get(`/encounters?patientId=${patientId}`),
  create: (data: any) => api.post('/encounters', data),
  get: (id: string) => api.get(`/encounters/${id}`),
  update: (id: string, data: any) => api.patch(`/encounters/${id}`, data),
};

// Reminders API
export const remindersAPI = {
  list: (status?: string) => api.get(`/reminders${status ? `?status=${status}` : ''}`),
  create: (data: any) => api.post('/reminders', data),
  update: (id: string, data: any) => api.patch(`/reminders/${id}`, data),
  delete: (id: string) => api.delete(`/reminders/${id}`),
};

// Investigations API
export const investigationsAPI = {
  list: (encounterId: string) => api.get(`/investigations?encounterId=${encounterId}`),
  create: (data: any) => api.post('/investigations', data),
  update: (id: string, data: any) => api.patch(`/investigations/${id}`, data),
};

export default api;
```

## Step 6: Create Audio Recording Hook

Create `hooks/useAudioRecording.ts`:

```typescript
import { useState, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

export interface UseAudioRecordingReturn {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  error: string | null;
}

export const useAudioRecording = (): UseAudioRecordingReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const { granted } = await Audio.requestPermissionsAsync();

      if (!granted) {
        throw new Error('Microphone permission not granted');
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);

      // Timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
      setError(errorMessage);
      console.error('Recording error:', err);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    try {
      if (!recordingRef.current || !isRecording) {
        return null;
      }

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();

      setIsRecording(false);
      setIsPaused(false);
      setRecordingTime(0);
      recordingRef.current = null;

      return uri;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop recording';
      setError(errorMessage);
      console.error('Error stopping recording:', err);
      return null;
    }
  }, [isRecording]);

  const pauseRecording = useCallback(async () => {
    try {
      if (recordingRef.current && isRecording && !isPaused) {
        await recordingRef.current.pauseAsync();
        setIsPaused(true);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Pause failed');
    }
  }, [isRecording, isPaused]);

  const resumeRecording = useCallback(async () => {
    try {
      if (recordingRef.current && isRecording && isPaused) {
        await recordingRef.current.resumeAsync();
        setIsPaused(false);
        timerRef.current = setInterval(() => {
          setRecordingTime((prev) => prev + 1);
        }, 1000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Resume failed');
    }
  }, [isRecording, isPaused]);

  return {
    isRecording,
    isPaused,
    recordingTime,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    error,
  };
};
```

## Step 7: Create Main Navigation Layout

Create `app/_layout.tsx`:

```typescript
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

// Set notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function RootLayout() {
  useEffect(() => {
    // Register for push notifications
    registerForPushNotifications();
    
    // Hide splash screen after app is ready
    SplashScreen.hideAsync();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#1e40af',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="recording/[id]" options={{ title: 'Record Encounter' }} />
    </Stack>
  );
}

async function registerForPushNotifications() {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === 'granted') {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Push token:', token);
      // Save token to backend for later use
    }
  } catch (error) {
    console.error('Failed to get push notification token:', error);
  }
}
```

## Step 8: Create Tab Navigation

Create `app/(tabs)/_layout.tsx`:

```typescript
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: string = '';

          if (route.name === 'dashboard') {
            iconName = 'home';
          } else if (route.name === 'patients') {
            iconName = 'hospital-box';
          } else if (route.name === 'reminders') {
            iconName = 'bell';
          } else if (route.name === 'settings') {
            iconName = 'cog';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1e40af',
        tabBarInactiveTintColor: '#999',
        headerShown: true,
      })}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          headerTitle: 'MediVoice Records',
        }}
      />
      <Tabs.Screen
        name="patients"
        options={{
          title: 'Patients',
          headerTitle: 'Patient Management',
        }}
      />
      <Tabs.Screen
        name="reminders"
        options={{
          title: 'Reminders',
          headerTitle: 'Upcoming Reminders',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerTitle: 'App Settings',
        }}
      />
    </Tabs>
  );
}
```

## Step 9: Create Dashboard Screen

Create `app/(tabs)/dashboard.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { patientsAPI } from '@/lib/api';

export default function DashboardScreen() {
  const router = useRouter();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const response = await patientsAPI.list();
      setPatients(response.data.data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <Text className="text-2xl font-bold text-gray-800 mb-4">
        Welcome Back, Doctor
      </Text>

      {/* Quick Actions */}
      <View className="flex-row gap-4 mb-6">
        <TouchableOpacity
          onPress={() => router.push('/new-patient')}
          className="flex-1 bg-blue-600 rounded-lg p-4"
        >
          <Text className="text-white font-bold text-center">+ New Patient</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(tabs)/reminders')}
          className="flex-1 bg-orange-500 rounded-lg p-4"
        >
          <Text className="text-white font-bold text-center">📌 Reminders</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Patients */}
      <Text className="text-lg font-bold text-gray-700 mb-3">Recent Patients</Text>
      {patients.slice(0, 5).map((patient) => (
        <TouchableOpacity
          key={patient.id}
          onPress={() => router.push(`/patient/${patient.id}`)}
          className="bg-white p-4 rounded-lg mb-2 border-l-4 border-l-blue-500"
        >
          <Text className="font-bold text-gray-800">
            {patient.first_name} {patient.last_name}
          </Text>
          <Text className="text-sm text-gray-600">{patient.phone_number}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
```

## Step 10: Build and Deploy

### Development Testing

```bash
# Start Expo development server
npm start

# OR
expo start

# Choose:
# - i: Open in iOS Simulator
# - a: Open in Android Emulator
# - w: Open in web browser
```

### Build for iOS

```bash
# Using EAS Cloud Build (recommended)
eas build --platform ios

# Output: .ipa file ready for TestFlight
```

### Build for Android

```bash
# Using EAS Cloud Build
eas build --platform android

# Output: .apk or .aab file
```

### Submit to App Stores

```bash
# iOS - TestFlight/App Store
eas submit --platform ios

# Android - Google Play
eas submit --platform android
```

## Step 11: Configure EAS (Expo Application Services)

```bash
# Link your project
eas init

# Configure build credentials
eas credentials

# Set up secrets for production
eas secret:create
```

Update `eas.json`:

```json
{
  "build": {
    "preview": {
      "ios": {
        "simulator": true
      },
      "android": {
        "buildType": "apk"
      }
    },
    "preview2": {
      "android": {
        "gradleCommand": ":app:assembleRelease"
      }
    },
    "preview3": {
      "developmentClient": true
    },
    "production": {
      "ios": {
        "image": "latest"
      },
      "android": {
        "image": "latest"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890"
      },
      "android": {
        "serviceAccount": "api-12345.json",
        "track": "internal"
      }
    }
  }
}
```

## Environment Variables

Create `.env` file:

```bash
EXPO_PUBLIC_API_URL=https://your-api.example.com
EXPO_PUBLIC_SUPABASE_URL=https://...supabase.co
EXPO_PUBLIC_SUPABASE_KEY=...
```

## Troubleshooting

### Microphone Permission Error
**Error:** "Microphone permission not granted"
**Solution:** Update `app.json` with microphone permission description

### Build Fails on EAS
**Solution:** Run `eas build --clean` to clear cache

### Notifications Not Working
**Solution:** Ensure notifications plugin in `app.json` and test with Expo CLI

## Next Steps

1. Build recording screen component
2. Integrate audio transcription
3. Add offline sync functionality
4. Set up push notifications
5. Test on real devices
6. Submit to app stores

---

**Reference:** [Expo Documentation](https://docs.expo.dev)
