# Running on Physical iOS Device

## Prerequisites
1. **Connect your iPhone** to your Mac via USB cable
2. **Trust your computer** on your iPhone (if prompted)
3. **Unlock your iPhone** and keep it unlocked during the process
4. **Sign in to Xcode** with your Apple ID:
   - Open Xcode → Settings → Accounts
   - Add your Apple ID if not already added

## Method 1: Using Expo CLI (Easiest)

### Step 1: Start the Metro bundler FIRST
**IMPORTANT:** You must start Metro before building/running the app!

```bash
cd mobile
npm start
```

Wait until you see:
```
Metro waiting on exp://192.168.x.x:8081
```

### Step 2: In a NEW terminal window, run on device
Keep the Metro bundler running, and open a new terminal:

```bash
cd mobile
npx expo run:ios --device
```

This will:
- Build the app for your connected device
- Install it automatically
- Launch it on your device

**Note:** The first time, you may need to:
- Trust your developer certificate on your iPhone: Settings → General → VPN & Device Management → Trust your developer account
- Wait for the build to complete (can take 5-10 minutes the first time)

### ⚠️ Troubleshooting "No script URL provided" Error

If you see this error, it means the app can't connect to Metro:

1. **Make sure Metro is running first** - Always start `npm start` before building
2. **Check your Mac's IP address** - Make sure your iPhone and Mac are on the same WiFi network
3. **Shake your device** - Open the developer menu (shake device or Cmd+D in simulator) and select "Configure Bundler"
4. **Enter your Mac's IP manually** - In the developer menu, enter: `http://YOUR_MAC_IP:8081`
   - Find your Mac's IP: System Settings → Network → WiFi → Details (or run `ipconfig getifaddr en0` in terminal)
5. **Try tunnel mode**:
   ```bash
   cd mobile
   npx expo start --tunnel
   ```

## Method 2: Using Xcode (More Control)

### Step 1: Open the workspace
```bash
cd mobile/ios
open Dineasy.xcworkspace
```

### Step 2: Select your device
1. In Xcode, click the device selector at the top (next to the play button)
2. Select your connected iPhone from the list

### Step 3: Configure signing (if needed)
1. Select the "Dineasy" project in the left sidebar
2. Select the "Dineasy" target
3. Go to "Signing & Capabilities" tab
4. Make sure "Automatically manage signing" is checked
5. Select your Team (should already be set to HTVM5ZUM3M)

### Step 4: Build and run
1. Click the Play button (▶️) or press `Cmd + R`
2. Wait for the build to complete
3. The app will install and launch on your device

### Step 5: Trust the developer (first time only)
If you see "Untrusted Developer" on your iPhone:
1. Go to Settings → General → VPN & Device Management
2. Tap on your developer account
3. Tap "Trust [Your Name]"
4. Tap "Trust" in the confirmation dialog
5. Go back to the home screen and open the app

## Troubleshooting

### "No devices found"
- Make sure your iPhone is connected via USB
- Unlock your iPhone
- Trust the computer on your iPhone if prompted
- Try unplugging and replugging the USB cable

### "Code signing error"
- Make sure you're signed in to Xcode with your Apple ID
- Check that "Automatically manage signing" is enabled
- Try cleaning the build: Product → Clean Build Folder (Shift+Cmd+K)

### "Build failed"
- Make sure you've run `pod install` in the `ios` directory:
  ```bash
  cd mobile/ios
  pod install
  ```
- Try cleaning: `cd mobile/ios && rm -rf build && cd ..`

### App icon not showing
- Delete the app from your device
- Clean build folder in Xcode (Shift+Cmd+K)
- Rebuild and reinstall

## Quick Commands

```bash
# Start Metro bundler
cd mobile && npm start

# Run on connected device (in another terminal)
cd mobile && npx expo run:ios --device

# Or build and run via Xcode
cd mobile/ios && open Dineasy.xcworkspace
```
