# Motor Health Monitoring Dashboard

Real-time web dashboard for visualizing motor sensor data and failure predictions from IoT sensors.

🌐 **Live Dashboard:** https://iot-project-481405.web.app

## Features

- 📊 **Real-time Multi-Line Graphs** - Interactive charts for temperature, vibration, RPM, and failure risk with hover tooltips
- 📈 **Combined Metrics View** - All sensor data visualized together with multiple Y-axes
- 🔍 **Search & Filter** - Search predictions by timestamp and filter by risk level (Low/Medium/High)
- 💳 **Enhanced Predictions Table** - Card-based design showing all sensor readings with each prediction
- 🗑️ **Clear All Data** - Admin button to wipe all data from the database
- ⏱️ **Precise Timestamps** - Shows date and time down to the second
- 🎨 **Modern UI Design** - Gradient backgrounds, smooth animations, and hover effects
- ⚡ **Live Updates** - Real-time data using Firestore listeners (up to 50 historical points)
- 📱 **Fully Responsive** - Works perfectly on desktop, tablet, and mobile devices

## Quick Start

The dashboard is already deployed and configured! Just visit:

**https://iot-project-481405.web.app**

No installation needed - works in any modern web browser.

---

## Setup (For Developers)

### Prerequisites

- Node.js and npm installed
- Firebase CLI
- GCP Project with Firestore enabled

### 1. Clone and Install

```powershell
cd dashboard
npm install -g firebase-tools
```

### 2. Firebase Configuration (Already Done)

The `app.js` file is already configured with:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyCPyG07m35NRrLxG8L3zGEXxR6PCZOifr8",
    authDomain: "iot-project-481405.firebaseapp.com",
    projectId: "iot-project-481405",
    storageBucket: "iot-project-481405.firebasestorage.app",
    messagingSenderId: "250203692178",
    appId: "1:250203692178:web:8b25d41d7783c182a75a4b"
};
```

### 3. Firestore Security Rules

**IMPORTANT:** To enable the "Clear All Data" button, you need to update your Firestore security rules to allow delete operations.

Go to: https://console.firebase.google.com/project/iot-project-481405/firestore/rules

Update the rules to:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;        // Public read access for dashboard
      allow write: if false;      // Only Cloud Run API can write
      allow delete: if true;      // Allow dashboard to delete data
    }
  }
}
```

**Or deploy rules via CLI:**

```powershell
firebase deploy --only firestore:rules
```

The `firestore.rules` file is included in the dashboard folder.

### 4. Local Development

Test locally before deploying:

```powershell
# Using Python
python -m http.server 8000

# Or using Node.js
npx serve

# Or open index.html directly in browser
```

Visit: http://localhost:8000

### 5. Deploy to Firebase Hosting

```powershell
# Login to Firebase (one time only)
firebase login

# Initialize (one time only)
firebase init hosting
# - Select project: iot-project-481405
# - Public directory: . (current directory)
# - Single-page app: Yes
# - Overwrite index.html: No

# Deploy
firebase deploy --only hosting
```

**Output:**
```
Hosting URL: https://iot-project-481405.web.app
```

### 6. Update Dashboard

After making changes to HTML/CSS/JS:

```powershell
firebase deploy --only hosting
```

Changes are live immediately!

---

## Architecture

```
ESP32 → Cloud Run API → Firestore Database
                            ↓
                     Dashboard (reads)
```

- **ESP32** sends sensor data to Cloud Run API
- **Cloud Run** processes data with ML model and stores in Firestore
- **Dashboard** reads from Firestore in real-time (no API calls needed)

---

## Dashboard Components

### Real-Time Interactive Charts

**Individual Metric Charts:**
- 🌡️ **Temperature Chart** - Shows temperature trends over time with hover values
- 📊 **Vibration Chart** - Displays vibration patterns and anomalies
- ⚙️ **RPM Chart** - Monitors rotational speed variations
- ⚠️ **Failure Risk Chart** - ML prediction trends (0-100%)

**Combined Multi-Line Chart:**
- All metrics on one graph with multiple Y-axes
- Color-coded lines for easy comparison
- Smooth animations and interactive tooltips
- Shows last 50 data points with automatic scrolling

### Search & Filter Controls

- 🔍 **Search Box** - Search predictions by timestamp
- 🎯 **Risk Filter Dropdown** - Filter by Low/Medium/High risk levels
- 🧹 **Clear Filters Button** - Reset all filters instantly

### Enhanced Predictions Table

Modern card-based design showing:
- 🕐 **Timestamp** - Date and time with seconds (24-hour format)
- 🌡️ **Temperature** - Exact reading in °C with icon
- 📊 **Vibration** - Exact reading in m/s² with icon
- ⚙️ **RPM** - Exact reading in rev/min with icon
- ⚠️ **Failure Risk** - Percentage with color-coded badge

**Table Features:**
- Scrollable list showing up to 50 predictions
- Hover effects with card lift animation
- Custom purple scrollbar
- "No results" message when filters don't match
- Color-coded sensor badges with left borders

### Risk Level Indicators

- 🟢 **Low Risk** (0-30%): Green gradient - Normal operation
- 🟡 **Medium Risk** (30-70%): Orange gradient - Monitor closely
- 🔴 **High Risk** (70-100%): Red gradient - Maintenance required

### Recent Predictions List

Shows last 50 predictions with:
- Timestamp with seconds
- All sensor readings (Temperature, Vibration, RPM)
- Failure probability
- Color-coded risk badge
- Search and filter capabilities

### Admin Controls

- 🗑️ **Clear All Data Button** - Permanently delete all sensor data and predictions
  - Double confirmation dialogs for safety
  - Progress indicator during deletion
  - Automatic UI reset after completion

---

## File Structure

```
dashboard/
├── index.html          # Main page structure with charts
├── style.css           # Modern card-based design with animations
├── app.js              # Chart.js integration and Firestore logic
├── firebase.json       # Firebase Hosting configuration
├── firestore.rules     # Firestore security rules (with delete permission)
├── .firebaserc         # Firebase project configuration
├── .gitignore          # Git exclusions
└── README.md           # This file
```

---

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Charts**: Chart.js 4.4.0 (real-time multi-line graphs)
- **Database**: Firebase Firestore (real-time NoSQL)
- **Hosting**: Firebase Hosting (CDN)
- **SDK**: Firebase JavaScript SDK v9 (compat mode)
- **Design**: CSS Grid, Flexbox, Gradient backgrounds, Card-based UI

Clean and modern - no frameworks needed! ✨

---

## Data Flow

### 1. Sensor Data Collection
```json
{
  "temperature": 35.5,
  "vibration": 0.03,
  "rpm": 1500,
  "timestamp": "2025-12-16T10:30:00Z"
}
```

### 2. ML Prediction
```json
{
  "sensor_data_id": "abc123xyz",
  "failure_probability": 0.0234,
  "timestamp": "2025-12-16T10:30:01Z"
}
```

### 3. Dashboard Display
Real-time updates via Firestore listeners - no polling needed!

---

## Firestore Collections

### `sensor_data`
- Document ID: Auto-generated by Firestore
- Fields: `temperature`, `vibration`, `rpm`, `timestamp`

### `predictions`
- Document ID: Auto-generated by Firestore
- Fields: `sensor_data_id` (links to sensor_data), `failure_probability`, `timestamp`

---

## Monitoring & Maintenance

### View Live Data
- **Firestore Console**: https://console.firebase.google.com/project/iot-project-481405/firestore
- **Hosting Console**: https://console.firebase.google.com/project/iot-project-481405/hosting

### Check Hosting Status
```powershell
firebase hosting:channel:list
```

### View Deployment History
```powershell
firebase hosting:releases:list
```

### Rollback to Previous Version
```powershell
firebase hosting:rollback
```

---

## Troubleshooting

### ❌ "Failed to connect to database"
**Solution:**
- Check Firebase config in `app.js`
- Verify Firestore rules allow `read: if true`
- Open browser console (F12) for detailed errors

### ❌ No data showing
**Solution:**
- Verify ESP32 is sending data to Cloud Run
- Check Firestore Console for data in collections
- Test Cloud Run API: `curl https://motor-health-api-250203692178.asia-southeast1.run.app/`

### ❌ Clear All Data button not working
**Solution:**
- Update Firestore security rules to include `allow delete: if true`
- Deploy rules: `firebase deploy --only firestore:rules`
- Check browser console (F12) for permission errors

### ❌ Charts not displaying
**Solution:**
- Verify Chart.js library is loading (check browser console)
- Ensure there's data in Firestore (need at least 1 prediction)
- Clear browser cache and reload
- Check for JavaScript errors in console (F12)

### ❌ Deployment fails
**Solution:**
```powershell
# Re-login
firebase login --reauth

# Set correct project
firebase use iot-project-481405

# Try deploying again
firebase deploy --only hosting
```

### ❌ CORS errors in local testing
**Solution:**
Use a local server (not file://):
```powershell
python -m http.server 8000
# or
npx serve
```

---

## Performance

- **Initial Load**: ~500ms (CDN cached)
- **Real-time Updates**: < 100ms (Firestore WebSocket)
- **Hosting**: Global CDN with automatic SSL
- **Scalability**: Unlimited viewers (Firebase scales automatically)

---

## Security

- ✅ **Read-only access** for public users
- ✅ **Write access** only from Cloud Run (authenticated)
- ✅ **HTTPS only** (automatic SSL certificate)
- ✅ **API keys** are public-safe (scoped to domain)

---

## Future Enhancements

- [x] Chart.js for historical graphs ✅
- [x] Enhanced table UI with sensor data ✅
- [x] Search and filter functionality ✅
- [x] Clear all data feature ✅
- [ ] Email/SMS alerts for high risk predictions
- [ ] Export data to CSV
- [ ] User authentication (Firebase Auth)
- [ ] Dark mode toggle
- [ ] Mobile app version (PWA)
- [ ] Customizable alert thresholds
- [ ] Data analytics dashboard

---

## Support

- **Firebase Console**: https://console.firebase.google.com/project/iot-project-481405
- **Cloud Run API**: https://motor-health-api-250203692178.asia-southeast1.run.app
- **Firestore Database**: https://console.firebase.google.com/project/iot-project-481405/firestore

---

## License

MIT License

---

## Project Context

Part of **Smart City Motor Health Monitoring System** (UN SDG 11 - Sustainable Cities and Communities)

- **Backend**: Cloud Run API with ML inference
- **Database**: Firestore real-time database
- **Frontend**: This dashboard
- **Hardware**: ESP32 with temperature, vibration, and RPM sensors
