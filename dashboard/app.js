// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCPyG07m35NRrLxG8L3zGEXxR6PCZOifr8",
    authDomain: "iot-project-481405.firebaseapp.com",
    projectId: "iot-project-481405",
    storageBucket: "iot-project-481405.firebasestorage.app",
    messagingSenderId: "250203692178",
    appId: "1:250203692178:web:8b25d41d7783c182a75a4b"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// DOM Elements
const tempEl = document.getElementById('temperature');
const vibEl = document.getElementById('vibration');
const rpmEl = document.getElementById('rpm');
const riskEl = document.getElementById('risk');
const lastUpdateEl = document.getElementById('last-update');
const totalReadingsEl = document.getElementById('total-readings');
const predictionsList = document.getElementById('predictions-list');

// Listen to latest sensor data
db.collection('sensor_data')
    .orderBy('timestamp', 'desc')
    .limit(1)
    .onSnapshot((snapshot) => {
        if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            const docId = snapshot.docs[0].id;
            
            // Update sensor readings
            tempEl.textContent = data.temperature.toFixed(1);
            vibEl.textContent = data.vibration.toFixed(3);
            rpmEl.textContent = data.rpm.toFixed(0);
            lastUpdateEl.textContent = new Date().toLocaleString();
            
            // Fetch corresponding prediction
            db.collection('predictions')
                .where('sensor_data_id', '==', docId)
                .limit(1)
                .get()
                .then((predSnapshot) => {
                    if (!predSnapshot.empty) {
                        const pred = predSnapshot.docs[0].data();
                        updateRisk(pred.failure_probability);
                    }
                });
        }
    });

// Listen to recent predictions
db.collection('predictions')
    .orderBy('timestamp', 'desc')
    .limit(10)
    .onSnapshot((snapshot) => {
        totalReadingsEl.textContent = snapshot.size;
        
        predictionsList.innerHTML = '';
        snapshot.forEach((doc) => {
            const data = doc.data();
            const item = createPredictionItem(data);
            predictionsList.appendChild(item);
        });
    });

// Update risk display with color coding
function updateRisk(probability) {
    const percentage = (probability * 100).toFixed(1);
    riskEl.textContent = percentage + '%';
    
    const riskCard = riskEl.closest('.stat-card');
    riskCard.classList.remove('risk-low', 'risk-medium', 'risk-high');
    
    if (probability < 0.3) {
        riskCard.classList.add('risk-low');
    } else if (probability < 0.7) {
        riskCard.classList.add('risk-medium');
    } else {
        riskCard.classList.add('risk-high');
    }
}

// Create prediction list item
function createPredictionItem(data) {
    const div = document.createElement('div');
    div.className = 'prediction-item';
    
    const probability = (data.failure_probability * 100).toFixed(1);
    const timestamp = data.timestamp.toDate().toLocaleString();
    const riskClass = data.failure_probability < 0.3 ? 'low' : 
                      data.failure_probability < 0.7 ? 'medium' : 'high';
    
    div.innerHTML = `
        <span class="pred-time">${timestamp}</span>
        <span class="pred-risk risk-${riskClass}">${probability}%</span>
    `;
    
    return div;
}

// Error handling
db.collection('sensor_data').limit(1).get()
    .catch((error) => {
        console.error('Error connecting to Firestore:', error);
        alert('Failed to connect to database. Check your Firebase configuration.');
    });
