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
const lastUpdateEl = document.getElementById('last-update');
const totalReadingsEl = document.getElementById('total-readings');
const predictionsList = document.getElementById('predictions-list');

// Data storage for charts (max 50 points)
const MAX_POINTS = 50;
const chartData = {
    labels: [],
    temperature: [],
    vibration: [],
    rpm: [],
    risk: []
};

// Chart configurations
const commonOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
    interaction: {
        mode: 'index',
        intersect: false,
    },
    plugins: {
        legend: {
            display: true,
            position: 'top',
        },
        tooltip: {
            enabled: true,
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#667eea',
            borderWidth: 1,
            padding: 12,
            displayColors: true,
            callbacks: {
                label: function(context) {
                    let label = context.dataset.label || '';
                    if (label) {
                        label += ': ';
                    }
                    if (context.parsed.y !== null) {
                        label += context.parsed.y.toFixed(2);
                        // Add units
                        if (context.dataset.label.includes('Temperature')) {
                            label += ' °C';
                        } else if (context.dataset.label.includes('Vibration')) {
                            label += ' m/s²';
                        } else if (context.dataset.label.includes('RPM')) {
                            label += ' rev/min';
                        } else if (context.dataset.label.includes('Risk')) {
                            label += '%';
                        }
                    }
                    return label;
                }
            }
        }
    },
    scales: {
        x: {
            display: true,
            title: {
                display: true,
                text: 'Time'
            },
            ticks: {
                maxTicksLimit: 10
            }
        },
        y: {
            display: true,
            beginAtZero: false
        }
    },
    animation: {
        duration: 750
    }
};

// Initialize individual charts
const temperatureChart = new Chart(document.getElementById('temperatureChart'), {
    type: 'line',
    data: {
        labels: chartData.labels,
        datasets: [{
            label: 'Temperature',
            data: chartData.temperature,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
        }]
    },
    options: {
        ...commonOptions,
        scales: {
            ...commonOptions.scales,
            y: {
                ...commonOptions.scales.y,
                title: {
                    display: true,
                    text: 'Temperature (°C)'
                }
            }
        }
    }
});

const vibrationChart = new Chart(document.getElementById('vibrationChart'), {
    type: 'line',
    data: {
        labels: chartData.labels,
        datasets: [{
            label: 'Vibration',
            data: chartData.vibration,
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
        }]
    },
    options: {
        ...commonOptions,
        scales: {
            ...commonOptions.scales,
            y: {
                ...commonOptions.scales.y,
                title: {
                    display: true,
                    text: 'Vibration (m/s²)'
                }
            }
        }
    }
});

const rpmChart = new Chart(document.getElementById('rpmChart'), {
    type: 'line',
    data: {
        labels: chartData.labels,
        datasets: [{
            label: 'RPM',
            data: chartData.rpm,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
        }]
    },
    options: {
        ...commonOptions,
        scales: {
            ...commonOptions.scales,
            y: {
                ...commonOptions.scales.y,
                title: {
                    display: true,
                    text: 'RPM (rev/min)'
                }
            }
        }
    }
});

const riskChart = new Chart(document.getElementById('riskChart'), {
    type: 'line',
    data: {
        labels: chartData.labels,
        datasets: [{
            label: 'Failure Risk',
            data: chartData.risk,
            borderColor: 'rgb(153, 102, 255)',
            backgroundColor: 'rgba(153, 102, 255, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
        }]
    },
    options: {
        ...commonOptions,
        scales: {
            ...commonOptions.scales,
            y: {
                ...commonOptions.scales.y,
                title: {
                    display: true,
                    text: 'Failure Risk (%)'
                },
                min: 0,
                max: 100
            }
        }
    }
});

// Combined chart with all metrics
const combinedChart = new Chart(document.getElementById('combinedChart'), {
    type: 'line',
    data: {
        labels: chartData.labels,
        datasets: [
            {
                label: 'Temperature (°C)',
                data: chartData.temperature,
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.1)',
                borderWidth: 2,
                yAxisID: 'y',
                tension: 0.4
            },
            {
                label: 'Vibration (m/s²)',
                data: chartData.vibration,
                borderColor: 'rgb(54, 162, 235)',
                backgroundColor: 'rgba(54, 162, 235, 0.1)',
                borderWidth: 2,
                yAxisID: 'y1',
                tension: 0.4
            },
            {
                label: 'RPM (rev/min)',
                data: chartData.rpm,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.1)',
                borderWidth: 2,
                yAxisID: 'y2',
                tension: 0.4
            },
            {
                label: 'Failure Risk (%)',
                data: chartData.risk,
                borderColor: 'rgb(153, 102, 255)',
                backgroundColor: 'rgba(153, 102, 255, 0.1)',
                borderWidth: 2,
                yAxisID: 'y3',
                tension: 0.4
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2.5,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
            tooltip: {
                enabled: true,
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#667eea',
                borderWidth: 1,
                padding: 12,
                displayColors: true
            }
        },
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: 'Time'
                },
                ticks: {
                    maxTicksLimit: 10
                }
            },
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                    display: true,
                    text: 'Temperature (°C)',
                    color: 'rgb(255, 99, 132)'
                },
                ticks: {
                    color: 'rgb(255, 99, 132)'
                }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                    display: true,
                    text: 'Vibration (m/s²)',
                    color: 'rgb(54, 162, 235)'
                },
                ticks: {
                    color: 'rgb(54, 162, 235)'
                },
                grid: {
                    drawOnChartArea: false,
                },
            },
            y2: {
                type: 'linear',
                display: false,
                position: 'left',
            },
            y3: {
                type: 'linear',
                display: false,
                position: 'right',
                min: 0,
                max: 100
            }
        }
    }
});

// Function to update charts with new data
function updateCharts(data, timestamp, riskValue) {
    const timeLabel = new Date(timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false 
    });
    
    // Add new data
    chartData.labels.push(timeLabel);
    chartData.temperature.push(data.temperature);
    chartData.vibration.push(data.vibration);
    chartData.rpm.push(data.rpm);
    chartData.risk.push(riskValue * 100);
    
    // Keep only MAX_POINTS
    if (chartData.labels.length > MAX_POINTS) {
        chartData.labels.shift();
        chartData.temperature.shift();
        chartData.vibration.shift();
        chartData.rpm.shift();
        chartData.risk.shift();
    }
    
    // Update all charts
    temperatureChart.update('none');
    vibrationChart.update('none');
    rpmChart.update('none');
    riskChart.update('none');
    combinedChart.update('none');
}

// Listen to sensor data changes and update charts
db.collection('sensor_data')
    .orderBy('timestamp', 'desc')
    .limit(1)
    .onSnapshot((snapshot) => {
        if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            const docId = snapshot.docs[0].id;
            
            lastUpdateEl.textContent = new Date().toLocaleString();
            
            // Fetch corresponding prediction
            db.collection('predictions')
                .where('sensor_data_id', '==', docId)
                .limit(1)
                .get()
                .then((predSnapshot) => {
                    if (!predSnapshot.empty) {
                        const pred = predSnapshot.docs[0].data();
                        
                        // Update charts with new data
                        updateCharts(data, data.timestamp.toDate(), pred.failure_probability);
                    }
                });
        }
    });

// Load historical data on startup
db.collection('sensor_data')
    .orderBy('timestamp', 'desc')
    .limit(MAX_POINTS)
    .get()
    .then((snapshot) => {
        const historicalData = [];
        
        snapshot.forEach((doc) => {
            historicalData.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Reverse to get chronological order
        historicalData.reverse();
        
        // Fetch predictions for each sensor data point
        const predictionPromises = historicalData.map((data) => 
            db.collection('predictions')
                .where('sensor_data_id', '==', data.id)
                .limit(1)
                .get()
        );
        
        return Promise.all(predictionPromises).then((predSnapshots) => {
            historicalData.forEach((data, index) => {
                const predSnapshot = predSnapshots[index];
                if (!predSnapshot.empty) {
                    const pred = predSnapshot.docs[0].data();
                    const timeLabel = new Date(data.timestamp.toDate()).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit', 
                        second: '2-digit',
                        hour12: false 
                    });
                    
                    chartData.labels.push(timeLabel);
                    chartData.temperature.push(data.temperature);
                    chartData.vibration.push(data.vibration);
                    chartData.rpm.push(data.rpm);
                    chartData.risk.push(pred.failure_probability * 100);
                }
            });
            
            // Update all charts
            temperatureChart.update();
            vibrationChart.update();
            rpmChart.update();
            riskChart.update();
            combinedChart.update();
        });
    })
    .catch((error) => {
        console.error('Error loading historical data:', error);
    });

// Store all predictions for filtering
let allPredictions = [];

// Listen to recent predictions
db.collection('predictions')
    .orderBy('timestamp', 'desc')
    .limit(50)
    .onSnapshot((snapshot) => {
        totalReadingsEl.textContent = snapshot.size;
        
        // Store all predictions with their IDs
        allPredictions = [];
        const promises = [];
        
        snapshot.forEach((doc) => {
            const predData = doc.data();
            
            // Fetch corresponding sensor data
            const promise = db.collection('sensor_data')
                .doc(predData.sensor_data_id)
                .get()
                .then((sensorDoc) => {
                    if (sensorDoc.exists) {
                        allPredictions.push({
                            id: doc.id,
                            prediction: predData,
                            sensor: sensorDoc.data()
                        });
                    }
                });
            
            promises.push(promise);
        });
        
        // Wait for all sensor data to be fetched
        Promise.all(promises).then(() => {
            // Sort by timestamp
            allPredictions.sort((a, b) => 
                b.prediction.timestamp.toDate() - a.prediction.timestamp.toDate()
            );
            displayPredictions(allPredictions);
        });
    });

// Display predictions
function displayPredictions(predictions) {
    predictionsList.innerHTML = '';
    
    if (predictions.length === 0) {
        predictionsList.innerHTML = '<div class="no-results">No predictions found</div>';
        return;
    }
    
    predictions.forEach((item) => {
        const predItem = createPredictionItem(item.prediction, item.sensor);
        predictionsList.appendChild(predItem);
    });
}

// Search and filter functionality
const searchInput = document.getElementById('search-input');
const riskFilter = document.getElementById('risk-filter');
const clearFiltersBtn = document.getElementById('clear-filters');

function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const riskLevel = riskFilter.value;
    
    let filtered = allPredictions.filter((item) => {
        const timestamp = item.prediction.timestamp.toDate().toLocaleString().toLowerCase();
        const matchesSearch = searchTerm === '' || timestamp.includes(searchTerm);
        
        let matchesRisk = true;
        if (riskLevel !== 'all') {
            const probability = item.prediction.failure_probability;
            if (riskLevel === 'low') {
                matchesRisk = probability < 0.3;
            } else if (riskLevel === 'medium') {
                matchesRisk = probability >= 0.3 && probability <= 0.7;
            } else if (riskLevel === 'high') {
                matchesRisk = probability > 0.7;
            }
        }
        
        return matchesSearch && matchesRisk;
    });
    
    displayPredictions(filtered);
}

searchInput.addEventListener('input', applyFilters);
riskFilter.addEventListener('change', applyFilters);

clearFiltersBtn.addEventListener('click', () => {
    searchInput.value = '';
    riskFilter.value = 'all';
    applyFilters();
});

// Create prediction list item
function createPredictionItem(predData, sensorData) {
    const div = document.createElement('div');
    div.className = 'prediction-item';
    
    const probability = (predData.failure_probability * 100).toFixed(1);
    const timestamp = predData.timestamp.toDate().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    const riskClass = predData.failure_probability < 0.3 ? 'low' : 
                      predData.failure_probability < 0.7 ? 'medium' : 'high';
    
    div.innerHTML = `
        <div class="pred-info">
            <div class="pred-time">
                <span class="time-icon">🕐</span>
                ${timestamp}
            </div>
            <div class="pred-sensors">
                <div class="sensor-badge temp">
                    <span class="sensor-icon">🌡️</span>
                    <div class="sensor-details">
                        <span class="sensor-label">Temperature</span>
                        <span class="sensor-number">${sensorData.temperature.toFixed(1)}°C</span>
                    </div>
                </div>
                <div class="sensor-badge vib">
                    <span class="sensor-icon">📊</span>
                    <div class="sensor-details">
                        <span class="sensor-label">Vibration</span>
                        <span class="sensor-number">${sensorData.vibration.toFixed(3)} m/s²</span>
                    </div>
                </div>
                <div class="sensor-badge rpm">
                    <span class="sensor-icon">⚙️</span>
                    <div class="sensor-details">
                        <span class="sensor-label">RPM</span>
                        <span class="sensor-number">${sensorData.rpm.toFixed(0)} rev/min</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="pred-risk-container">
            <div class="risk-label">Failure Risk</div>
            <div class="pred-risk risk-${riskClass}">${probability}%</div>
        </div>
    `;
    
    return div;
}

// Error handling
db.collection('sensor_data').limit(1).get()
    .catch((error) => {
        console.error('Error connecting to Firestore:', error);
        alert('Failed to connect to database. Check your Firebase configuration.');
    });

// Clear all data functionality
const clearAllBtn = document.getElementById('clear-all-btn');

clearAllBtn.addEventListener('click', async () => {
    const confirmation = confirm(
        '⚠️ WARNING: This will permanently delete ALL sensor data and predictions from the database.\n\n' +
        'Are you absolutely sure you want to continue?'
    );
    
    if (!confirmation) {
        return;
    }
    
    // Double confirmation for safety
    const doubleConfirm = confirm(
        '🚨 FINAL CONFIRMATION\n\n' +
        'This action CANNOT be undone!\n\n' +
        'Click OK to permanently delete all data.'
    );
    
    if (!doubleConfirm) {
        return;
    }
    
    try {
        clearAllBtn.disabled = true;
        clearAllBtn.textContent = '🔄 Deleting...';
        clearAllBtn.style.opacity = '0.6';
        
        // Delete all predictions
        const predictionsSnapshot = await db.collection('predictions').get();
        const predictionDeletePromises = [];
        predictionsSnapshot.forEach((doc) => {
            predictionDeletePromises.push(doc.ref.delete());
        });
        await Promise.all(predictionDeletePromises);
        console.log(`Deleted ${predictionDeletePromises.length} predictions`);
        
        // Delete all sensor data
        const sensorDataSnapshot = await db.collection('sensor_data').get();
        const sensorDeletePromises = [];
        sensorDataSnapshot.forEach((doc) => {
            sensorDeletePromises.push(doc.ref.delete());
        });
        await Promise.all(sensorDeletePromises);
        console.log(`Deleted ${sensorDeletePromises.length} sensor data records`);
        
        // Clear chart data
        chartData.labels = [];
        chartData.temperature = [];
        chartData.vibration = [];
        chartData.rpm = [];
        chartData.risk = [];
        
        // Update all charts
        temperatureChart.update();
        vibrationChart.update();
        rpmChart.update();
        riskChart.update();
        combinedChart.update();
        
        // Clear predictions list
        allPredictions = [];
        predictionsList.innerHTML = '<div class="no-results">No data available</div>';
        
        // Reset footer values
        totalReadingsEl.textContent = '0';
        lastUpdateEl.textContent = 'Never';
        
        alert(`✅ Successfully deleted all data!\n\nPredictions: ${predictionDeletePromises.length}\nSensor Data: ${sensorDeletePromises.length}`);
        
    } catch (error) {
        console.error('Error deleting data:', error);
        alert(`❌ Error deleting data: ${error.message}\n\nMake sure your Firestore security rules allow delete operations.`);
    } finally {
        clearAllBtn.disabled = false;
        clearAllBtn.innerHTML = '🗑️ Clear All Data';
        clearAllBtn.style.opacity = '1';
    }
});
