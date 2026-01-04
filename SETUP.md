# Ozianaluo Agent - Configuration Guide

## Quick Setup

### 1. Change API Domain

**File:** `src/config/api.js`

```javascript
export const API_CONFIG = {
  DOMAIN: 'https://ozianaluo.com',  // ⬅️ CHANGE THIS
  // ...
};
```

Your API endpoints will automatically update:
- Login: `{DOMAIN}/api/agent/login`
- Location: `{DOMAIN}/api/agent/location`
- Location Batch: `{DOMAIN}/api/agent/location-batch`

### 2. Location Update Interval

**File:** `src/config/api.js`

```javascript
export const LOCATION_UPDATE_INTERVAL = 30000; // 30 seconds
```

Adjust based on your needs:
- `10000` = 10 seconds (battery intensive, more accurate)
- `30000` = 30 seconds (balanced)
- `60000` = 1 minute (battery efficient)

### 3. Batch Size

**File:** `src/config/api.js`

```javascript
export const BATCH_SIZE = 10; // locations per batch
```

How many locations to collect before sending to server.

## Building APK

### Step 1: Ensure All Dependencies Installed

```bash
npm install
```

### Step 2: Install EAS CLI (one-time)

```bash
npm install -g eas-cli
```

### Step 3: Build APK

```bash
eas build --platform android --local
```

The APK will be generated in `./dist/` folder.

### Step 4: Install on Phone

1. Transfer APK to your phone via USB cable
2. On phone: Settings → Security → Enable "Unknown sources"
3. Open file manager → Downloads → Tap APK file
4. Tap Install

## Project Structure

```
ozianaluo-agent-app/
├── src/
│   ├── config/
│   │   └── api.js              # ⬅️ CHANGE DOMAIN HERE
│   ├── services/
│   │   ├── api.js              # API client
│   │   └── location.js         # Location tracking
│   └── screens/
│       ├── LoginScreen.js       # Login UI
│       └── HomeScreen.js        # Main app UI
├── App.js                       # Root component
├── app.json                     # Expo config
├── package.json                 # Dependencies
└── README.md                    # This file
```

## Permissions (Android)

The app requests these permissions:
- `ACCESS_FINE_LOCATION` - Precise GPS
- `ACCESS_COARSE_LOCATION` - Approximate location
- `ACCESS_BACKGROUND_LOCATION` - Background tracking
- `INTERNET` - API calls

## Testing

### Via Expo Go App

```bash
npm start
# Scan QR code with phone's Expo Go app
```

### Via Android Emulator

```bash
npm run android
```

### Manual Testing Checklist

- [ ] Agent can login with phone/password
- [ ] Location permission is requested and granted
- [ ] "Start Tracking" button works
- [ ] Locations appear in server logs
- [ ] "Stop Tracking" button works
- [ ] Agent can logout

## Troubleshooting

### API Connection Failed
1. Check `src/config/api.js` - is domain correct?
2. Verify backend server is running
3. Check network connectivity

### Location Not Updating
1. Verify location permissions are granted
2. Check app has foreground + background permissions
3. Verify GPS is enabled on phone
4. Try increasing update interval in config

### APK Won't Build
1. Clear cache: `npm install`
2. Clear EAS cache: `eas build --platform android --local --clear-cache`
3. Check Node.js version: `node --version` (should be 16+)

## Backend Requirements

Your Laravel API must handle:

```
POST /api/agent/login
{
  "phone": "08123456789",
  "password": "password"
}

POST /api/agent/location
{
  "booking_id": 1,
  "latitude": 6.427,
  "longitude": 3.428,
  "accuracy": 5.0,
  "timestamp": "2026-01-04T10:00:00Z"
}

POST /api/agent/location-batch
{
  "booking_id": 1,
  "locations": [
    {"latitude": 6.427, "longitude": 3.428, "accuracy": 5.0, "timestamp": "..."},
    {"latitude": 6.428, "longitude": 3.429, "accuracy": 5.0, "timestamp": "..."}
  ]
}

GET /api/agent/current-delivery
(returns current booking info)

POST /api/agent/logout
(clears session)
```

All endpoints protected by `auth:sanctum` middleware with API token.

## Version

- **App Name:** Ozianaluo Agent
- **Version:** 1.0.0
- **Package:** com.ozianaluo.agent
- **Platform:** Android (5.0+)
