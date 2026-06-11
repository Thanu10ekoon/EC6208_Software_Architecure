# Traffic Officer Functionality — Implementation Guide

This document covers everything needed to implement the Traffic Officer screens in the SmartFines mobile app. The navigation skeleton and placeholder screens already exist — this guide tells you exactly what to build inside them.

---

## 1. What Needs to Be Built

Three screens need real implementations:

| Screen | File | Purpose |
|--------|------|---------|
| Officer Dashboard | `src/screens/officer/OfficerDashboardScreen.jsx` | Overview stats + quick links |
| Issue Fine | `src/screens/officer/IssueFineScreen.jsx` | Form to issue a fine to a driver |
| Officer Fines | `src/screens/officer/OfficerFinesScreen.jsx` | List all fines issued by this officer |

---

## 2. Backend API Endpoints

These are the endpoints the officer screens will call. Verify the exact paths against the Spring Boot backend (`EC6208_Software_Architecure/SmartFines/backend`).

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/fines/officer` | Returns all fines issued by the authenticated officer |
| `POST` | `/fines` | Issues a new fine. Body described in Section 5. |

The existing Axios client in `src/api/client.js` already attaches the JWT Bearer token to every request automatically — no changes needed there.

---

## 3. Officer API Module

Create `src/api/officerFines.js`:

```js
import client from './client';

// Returns all fines this officer has issued
export const listOfficerFines = () => client.get('/fines/officer').then(r => r.data);

// Issues a new fine to a driver
export const issueFine = (payload) => client.post('/fines', payload).then(r => r.data);
```

---

## 4. Officer Dashboard Screen

**File:** `src/screens/officer/OfficerDashboardScreen.jsx`

The dashboard should show summary stats derived from the officer's issued fines. It follows the exact same visual pattern as `DriverDashboardScreen` — reuse the `StatCard` component structure.

**Data source:** call `listOfficerFines()` on mount.

**Stats to compute from the fines array:**

```js
const stats = useMemo(() => {
  const today = new Date().toDateString();
  const issuedToday = fines.filter(
    f => new Date(f.violationDate).toDateString() === today
  ).length;
  const totalIssued = fines.length;
  const activeFines = fines.filter(
    f => !['PAID', 'CANCELLED', 'VOID'].includes(f.status)
  ).length;
  const paidFines = fines.filter(f => f.status === 'PAID').length;
  return { issuedToday, totalIssued, activeFines, paidFines };
}, [fines]);
```

**Stat cards to show:**

| Label | Value | Icon | Color |
|-------|-------|------|-------|
| Issued Today | `stats.issuedToday` | `today-outline` | accent |
| Total Issued | `stats.totalIssued` | `document-text-outline` | accent |
| Active Fines | `stats.activeFines` | `warning-outline` | accent if > 0 |
| Collected | `stats.paidFines` | `checkmark-circle` | mint |

**Quick access links** at the bottom (same style as driver dashboard):
- "Issue a Fine" → `navigation.navigate('IssueFine')`
- "View Issued Fines" → `navigation.navigate('MyFines')`

**Full screen skeleton:**

```jsx
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, shadow, spacing } from '../../constants/theme';
import { listOfficerFines } from '../../api/officerFines';
import { extractApiError } from '../../utils/apiError';
import ErrorBanner from '../../components/ErrorBanner';

function StatCard({ label, value, helper, icon, iconBg, iconColor, highlight }) {
  return (
    <View style={styles.card}>
      <View style={[styles.cardIconWrap, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={16} color={iconColor} />
      </View>
      <Text style={[styles.cardValue, highlight && styles.cardValueHL]}>{value}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardHelper}>{helper}</Text>
    </View>
  );
}

export default function OfficerDashboardScreen({ navigation }) {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const data = await listOfficerFines();
      setFines(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onRefresh = () => { setRefreshing(true); load(true); };

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const issuedToday = fines.filter(f => new Date(f.violationDate).toDateString() === today).length;
    const totalIssued = fines.length;
    const activeFines = fines.filter(f => !['PAID', 'CANCELLED', 'VOID'].includes(f.status)).length;
    const paidFines = fines.filter(f => f.status === 'PAID').length;
    return { issuedToday, totalIssued, activeFines, paidFines };
  }, [fines]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} colors={[colors.accent]} />}
    >
      <ErrorBanner message={error} />
      <View style={styles.grid}>
        <StatCard label="Issued today" value={stats.issuedToday} helper="Today's activity" icon="today-outline" iconBg={colors.accentSoft} iconColor={colors.accentStrong} highlight={stats.issuedToday > 0} />
        <StatCard label="Total issued" value={stats.totalIssued} helper="All time" icon="document-text-outline" iconBg={colors.accentSoft} iconColor={colors.accentStrong} />
        <StatCard label="Active" value={stats.activeFines} helper="Unpaid fines" icon="warning-outline" iconBg={colors.accentSoft} iconColor={colors.accentStrong} highlight={stats.activeFines > 0} />
        <StatCard label="Collected" value={stats.paidFines} helper="Paid fines" icon="checkmark-circle" iconBg={colors.mintSoft} iconColor={colors.mint} />
      </View>

      <Text style={styles.sectionHeader}>Quick access</Text>
      <View style={styles.linkRow}>
        <TouchableOpacity style={styles.linkCard} onPress={() => navigation.navigate('IssueFine')} activeOpacity={0.75}>
          <View style={styles.linkIconWrap}><Ionicons name="add-circle-outline" size={18} color={colors.accent} /></View>
          <Text style={styles.linkCardText}>Issue a Fine</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkCard} onPress={() => navigation.navigate('MyFines')} activeOpacity={0.75}>
          <View style={styles.linkIconWrap}><Ionicons name="document-text-outline" size={18} color={colors.accent} /></View>
          <Text style={styles.linkCardText}>View Issued Fines</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Copy the styles from DriverDashboardScreen — they are identical.
// Replace this comment with the full styles block from that file.
```

---

## 5. Issue Fine Screen

**File:** `src/screens/officer/IssueFineScreen.jsx`

This is a form screen that submits a new fine. It uses `react-hook-form` + `yup` and the existing `FormInput` component, exactly like `DriverSignupScreen`.

### 5.1 Request Payload

Confirm the exact field names against the backend `FineRequest` DTO. Expected shape:

```json
{
  "driverNic": "string",
  "vehicleNumber": "string",
  "violationDetails": "string",
  "violationDate": "YYYY-MM-DD",
  "dueDate": "YYYY-MM-DD",
  "fineAmount": 2500.00,
  "location": "string",
  "regionId": 1
}
```

### 5.2 Validation Schema

```js
import * as yup from 'yup';

const schema = yup.object({
  driverNic: yup.string().required('Driver NIC is required'),
  vehicleNumber: yup.string().required('Vehicle number is required'),
  violationDetails: yup.string().required('Violation details are required'),
  violationDate: yup.string().required('Violation date is required'),
  dueDate: yup.string().required('Due date is required'),
  fineAmount: yup
    .number()
    .positive('Must be a positive amount')
    .required('Fine amount is required')
    .transform((v, o) => (o === '' ? undefined : v)),
  location: yup.string().required('Location is required'),
  regionId: yup
    .number()
    .integer()
    .positive()
    .nullable()
    .transform((v, o) => (o === '' ? null : v)),
});
```

### 5.3 Date Pickers

Both `violationDate` and `dueDate` use `@react-native-community/datetimepicker`, which is already installed. Copy the exact date picker pattern from `DriverSignupScreen` — the `showDatePicker` state toggle, `Pressable` trigger button, and `DateTimePicker` `onChange` handler.

For two separate pickers, use two separate `useState` flags:
```js
const [showViolationDatePicker, setShowViolationDatePicker] = useState(false);
const [showDueDatePicker, setShowDueDatePicker] = useState(false);
```

### 5.4 Submission Handler

```js
const onSubmit = async (data) => {
  setApiError('');
  setLoading(true);
  try {
    await issueFine({
      ...data,
      fineAmount: Number(data.fineAmount),
      regionId: data.regionId ? Number(data.regionId) : null,
    });
    // Reset the form and show a success message
    reset();
    Alert.alert('Fine Issued', 'The fine has been successfully recorded.', [{ text: 'OK' }]);
  } catch (err) {
    setApiError(extractApiError(err));
  } finally {
    setLoading(false);
  }
};
```

After a successful submission, use `Alert.alert()` to confirm to the officer. Do NOT navigate away — the officer may want to issue multiple fines in sequence. Use `reset()` from `useForm` to clear the form.

### 5.5 Screen Structure

```
SafeAreaView
  KeyboardAvoidingView
    ScrollView
      View (card — same style as DriverSignupScreen card)
        Text eyebrow "ISSUE FINE"
        Text heading "New violation"
        Text subtitle

        FormInput — Driver NIC
        FormInput — Vehicle Number
        FormInput — Violation Details (multiline)
        FormInput — Location
        FormInput — Fine Amount (keyboardType="decimal-pad")
        Date picker — Violation Date
        Date picker — Due Date
        FormInput — Region ID (optional)

        ErrorBanner
        Submit button — "Issue Fine"
```

Use the identical card styles from `DriverSignupScreen` — `backgroundColor: colors.surface`, `borderRadius: radius.xl`, `padding: spacing.xl`, `borderWidth: 1`, `borderColor: colors.border`, plus the `shadow` from theme.

### 5.6 Required Imports

```js
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { issueFine } from '../../api/officerFines';
import FormInput from '../../components/FormInput';
import ErrorBanner from '../../components/ErrorBanner';
import { extractApiError } from '../../utils/apiError';
import { colors, fonts, radius, shadow, spacing } from '../../constants/theme';
```

---

## 6. Officer Fines Screen

**File:** `src/screens/officer/OfficerFinesScreen.jsx`

This is a list screen showing every fine this officer has issued. It follows the exact same pattern as `DriverFinesScreen` — copy it and swap `listDriverFines` for `listOfficerFines`.

**Key differences from the driver fines screen:**

1. **Extra info to show**: In each card, show the driver NIC and vehicle number (the driver sees their own NIC, but the officer needs to see who they issued it to):
   ```jsx
   <Text style={styles.driverRef}>NIC: {fine.driverNic} · {fine.vehicleNumber}</Text>
   ```

2. **Status bar colors**: Same `STATUS_STYLES` map as in `DriverFinesScreen` — copy it unchanged.

3. **Empty state message**: Use `"No fines issued yet"` with subtitle `"Fines you issue will appear here."`.

**FineCard structure for officer view:**

```jsx
function FineCard({ fine }) {
  const s = STATUS_STYLES[fine.status] ?? STATUS_STYLES.ISSUED;
  return (
    <View style={styles.card}>
      <View style={[styles.statusBar, { backgroundColor: s.bar }]} />
      <View style={styles.cardContent}>
        <View style={styles.cardTop}>
          <Text style={styles.ref} numberOfLines={1}>{fine.fineReferenceNumber}</Text>
          <View style={[styles.badge, { backgroundColor: s.bg }]}>
            <Text style={[styles.badgeText, { color: s.text }]}>{fine.status}</Text>
          </View>
        </View>
        <Text style={styles.driverRef}>
          {fine.driverNic} · {fine.vehicleNumber}
        </Text>
        <Text style={styles.violation} numberOfLines={2}>{fine.violationDetails}</Text>
        <View style={styles.cardBottom}>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
            <Text style={styles.metaText}>{formatDate(fine.violationDate)}</Text>
          </View>
          <Text style={styles.amount}>{formatCurrency(fine.fineAmount)}</Text>
        </View>
      </View>
    </View>
  );
}
```

**Page header text:**

```jsx
<Text style={styles.title}>Issued Fines</Text>
<Text style={styles.subtitle}>Fines you have issued to drivers.</Text>
```

---

## 7. Styles Reference

All officer screens use the same design tokens and style patterns as the driver screens. Import from `../../constants/theme`:

```js
import { colors, fonts, radius, shadow, spacing } from '../../constants/theme';
```

**Consistent style values to use:**

```js
// Page headings
title: { fontSize: 24, fontFamily: fonts.bold, color: colors.text, letterSpacing: -0.4, marginBottom: 4 }
subtitle: { fontSize: 13, fontFamily: fonts.regular, color: colors.textMuted, lineHeight: 19 }

// Cards
card: { backgroundColor: colors.surface, borderRadius: radius.md, overflow: 'hidden', flexDirection: 'row', ...shadow }
statusBar: { width: 3 }
cardContent: { flex: 1, padding: spacing.md }

// Badges
badge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.sm }
badgeText: { fontSize: 10, fontFamily: fonts.bold, textTransform: 'uppercase', letterSpacing: 0.5 }

// Amounts
amount: { fontSize: 15, fontFamily: fonts.bold, color: colors.text }

// Section headers (uppercase labels)
sectionHeader: { fontSize: 11, fontFamily: fonts.semiBold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: spacing.sm }
```

---

## 8. Checklist

- [ ] Create `src/api/officerFines.js` with `listOfficerFines` and `issueFine`
- [ ] Implement `OfficerDashboardScreen` with stats + quick links
- [ ] Implement `IssueFineScreen` with full form, two date pickers, and success alert
- [ ] Implement `OfficerFinesScreen` with `FineCard` showing driver NIC and vehicle number
- [ ] Verify backend endpoint paths match (`/fines/officer`, `POST /fines`) against the Spring Boot controllers
- [ ] Verify the `issueFine` request body field names match the backend DTO
- [ ] Test date picker on both Android (`display="default"`) and iOS (`display="spinner"`)
- [ ] Test form validation by submitting with missing fields

---

## 9. Notes

- The `@react-native-community/datetimepicker` package is already installed — no new installs needed.
- The `extractApiError` utility in `src/utils/apiError.js` handles both network errors and backend validation messages — use it in every `catch` block.
- The `ErrorBanner` component already handles `null`/empty messages by rendering nothing — safe to always render it.
- The authenticated officer's `userId` is available from `useAuth().session.userId` if the backend needs it implicitly — but typically the JWT already identifies who is issuing the fine.
- For `fineAmount`, use `keyboardType="decimal-pad"` on the `FormInput` and convert with `Number()` before sending to the API.
