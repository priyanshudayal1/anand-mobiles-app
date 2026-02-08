# 🔥 Firebase Cloud Messaging (FCM) Setup for Push Notifications

## ⚠️ The Issue

Your app is **hanging when trying to get the Expo push token** because **Firebase Cloud Messaging (FCM) is not properly configured** in your Firebase project.

When you use `google-services.json` in your Android app, Expo tries to use FCM for push notifications. If FCM isn't enabled, the token request will hang indefinitely.

## ✅ Solution: Enable FCM in Firebase

### Step 1: Open Firebase Console
1. Go to: https://console.firebase.google.com/project/anandmobiles-daa8b/settings/cloudmessaging
2. Sign in with your Firebase account

### Step 2: Enable Cloud Messaging API
1. Look for **"Cloud Messaging API (Legacy)"** section
2. If you see a message saying "Cloud Messaging API is disabled":
   - Click **"Enable"** or **"Manage API"**
   - This will take you to Google Cloud Console
3. In Google Cloud Console:
   - Find **"Cloud Messaging API"** (not Legacy)
   - Click **"ENABLE"**
   - Wait for it to enable (takes ~30 seconds)

### Step 3: Get Server Key (Optional - for backend)
1. In Firebase Console > Project Settings > Cloud Messaging
2. Look for **"Server key"** under Cloud Messaging API (Legacy)
3. Copy this key (you might need it for backend FCM configuration)

### Step 4: Verify Configuration
After enabling FCM:
1. Restart your Expo app
2. Check the logs - you should now see:
   ```
   LOG  [Notification] ✅ Got Expo push token: ExponentPushToken[...]
   LOG  [Notification] 🤖 Setting up Android notification channel...
   LOG  [Notification] ✅ Push notification registration complete!
   ```

## 🔄 Alternative: Use Expo's Managed Push Service (Without FCM)

If you don't want to use FCM, you can use Expo's managed push notification service instead. However, since you're using Google Sign-In (which requires `google-services.json`), you'll still need the Firebase config file.

**The best approach is to enable FCM as described above.**

## 🧪 Testing After Setup

1. **Rebuild your app** (if you made changes to google-services.json):
   ```bash
   npx expo prebuild --clean
   npx expo run:android
   ```

2. **Check the logs** for successful token registration:
   ```
   LOG  [Notification] ✅ Got Expo push token: ExponentPushToken[...]
   LOG  [Notification] ✅ Token registered with backend
   ```

3. **Test push notification** from backend:
   - Create a test order or trigger any notification
   - You should receive a push notification on your device!

## 📱 Expected Flow After Fix

```
1. App starts → Requests notification permissions ✅
2. Permissions granted → Gets Expo push token ✅ (was hanging here before)
3. Token received → Registers with backend ✅
4. Backend sends notification → Device receives it ✅
```

## 🐛 Troubleshooting

### Still hanging at "Getting Expo push token"?
1. Make sure FCM API is **enabled** in Google Cloud Console
2. Wait 5-10 minutes after enabling (API changes take time to propagate)
3. Restart your app completely

### Token received but notifications not showing?
1. Check backend logs for Expo push errors
2. Make sure backend is restarted with the new Expo push code
3. Verify token is being sent to backend correctly

### Error: "Token request timeout"?
1. FCM is not enabled - follow Step 2 above
2. Or there's a network/firewall issue blocking Firebase

## 📚 Resources

- [Firebase Console - Your Project](https://console.firebase.google.com/project/anandmobiles-daa8b)
- [Expo Push Notifications](https://docs.expo.dev/push-notifications/overview/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)

---

**After enabling FCM, restart your app and check the logs. The push notification system should work perfectly!** 🎉
