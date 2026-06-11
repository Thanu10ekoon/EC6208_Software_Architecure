# SmartFines Mobile — Dev Setup & Run Guide

## Prerequisites

- Node.js 18+
- Expo Go installed on your phone (Play Store / App Store)
- SmartFines Spring Boot backend running on port 8151
- Phone and PC on the **same Wi-Fi network**

---

## 1. Update the API IP address

Open `src/constants/config.js` and set `API_BASE_URL` to your PC's local Wi-Fi IP:

```js
export const API_BASE_URL = 'http://YOUR_PC_IP:8151/api';
```

**Finding your PC's Wi-Fi IP (Windows):**

```powershell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -like "*Wi-Fi*" }
```

Look for the `IPAddress` value, e.g. `192.168.1.7`.

**Verify the backend is reachable from your PC's browser:**

```
http://YOUR_PC_IP:8151/api/auth/login
```

You should see a JSON error response (not a timeout).

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Run with Expo Go

```bash
npx expo start
```

- Open **Expo Go** on your phone
- Scan the QR code shown in the terminal
- The app will bundle and launch on your device

**Shortcuts in the terminal:**
- `r` — reload the app
- `a` — open on Android emulator (requires Android Studio)
- `j` — open JS debugger

---

## 4. Fix: Phone cannot reach the backend ("Cannot reach server")

This happens when Windows Firewall blocks inbound connections on port 8151 from the local network.

**Step 1 — Open PowerShell as Administrator**

Search for PowerShell in the Start menu → right-click → Run as administrator.

**Step 2 — Set your Wi-Fi network to Private**

```powershell
Set-NetConnectionProfile -InterfaceAlias "Wi-Fi" -NetworkCategory Private
```

This is safe to do on a home or office network. Public profile blocks most inbound connections between devices.

**Step 3 — Add a firewall rule for port 8151**

```powershell
New-NetFirewallRule -DisplayName "SmartFines Backend (8151)" -Direction Inbound -Protocol TCP -LocalPort 8151 -Action Allow -Profile Private,Domain,Public
```

**Step 4 — Verify from the phone's browser**

Open your phone's browser and go to:

```
http://YOUR_PC_IP:8151/api/auth/login
```

If you see a JSON response, the connection is working. Reload the Expo app and try again.

**If already added the rule but it still fails:**

The rule may only cover Private/Domain but your Wi-Fi is classified as Public. Update the existing rule:

```powershell
Set-NetFirewallRule -DisplayName "SmartFines Backend (8151)" -Profile Private,Domain,Public
```

---

## 5. Fix: "Project is incompatible with this version of Expo Go"

This project uses **Expo SDK 54**. Your Expo Go must support SDK 54.

- Check your Expo Go version in the app settings
- Update Expo Go from the Play Store / App Store if needed
- Expo Go 2.32.x supports SDK 54

---

## 6. Fix: IP changes after reconnecting to Wi-Fi

Your PC's local IP can change. When it does:

1. Find the new IP (Step 1 above)
2. Update `src/constants/config.js`
3. Press `r` in the Expo terminal to reload

To avoid this repeatedly, assign a **static IP** to your PC in your router's DHCP settings.
