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
const connectionStatusEl = document.getElementById('connection-status');
const statusTextEl = connectionStatusEl.querySelector('.status-text');
const pauseBtn = document.getElementById('pause-btn');
const exportBtn = document.getElementById('export-btn');
const timeValueInput = document.getElementById('time-value');
const timeUnitSelect = document.getElementById('time-unit');
const applyTimeFilterBtn = document.getElementById('apply-time-filter');

// State management
let isPaused = false;
let currentTimeValue = 30;
let currentTimeUnit = 'minutes';


// Data storage for charts

const chartData = {
    labels: [],
    timestamps: [], // Raw timestamps for sliding window logic
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
                label: function (context) {
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
    const timeLabel = formatTimeLabel(new Date(timestamp));

    // Verify data integrity before pushing
    if (data.temperature === undefined || data.vibration === undefined || data.rpm === undefined) {
        return;
    }

    // Always update internal data structures
    chartData.labels.push(timeLabel);
    chartData.timestamps.push(new Date(timestamp).getTime()); // Store raw ms
    chartData.temperature.push(data.temperature);
    chartData.vibration.push(data.vibration);
    chartData.rpm.push(data.rpm);
    chartData.risk.push(riskValue * 100);

    // Initial trim (triggered by data arrival)
    enforceRollingWindow();

    // Only update visual charts if NOT paused
    if (!isPaused) {
        updateAllCharts();
    }
}

// Helper to update all charts
function updateAllCharts() {
    temperatureChart.update('none');
    vibrationChart.update('none');
    rpmChart.update('none');
    riskChart.update('none');
    combinedChart.update('none');
}

// Helper to remove points outside the time window
function enforceRollingWindow() {
    const duration = getDurationInMillis();
    // Allow a small buffer (e.g. 1 second)
    const cutoffTime = Date.now() - duration - 1000;

    let pointsRemoved = false;

    while (chartData.timestamps.length > 0 && chartData.timestamps[0] < cutoffTime) {
        chartData.labels.shift();
        chartData.timestamps.shift();
        chartData.temperature.shift();
        chartData.vibration.shift();
        chartData.rpm.shift();
        chartData.risk.shift();
        pointsRemoved = true;
    }

    // Safety Cap
    if (chartData.labels.length > 2000) {
        chartData.labels.shift();
        chartData.timestamps.shift();
        chartData.temperature.shift();
        chartData.vibration.shift();
        chartData.rpm.shift();
        chartData.risk.shift();
        pointsRemoved = true;
    }

    return pointsRemoved;
}

// Continuous enforcement of rolling window (every 1 second)
// This ensures the chart "moves" and data drops off even if no new data arrives.
setInterval(() => {
    if (!isPaused && chartData.timestamps.length > 0) {
        const changed = enforceRollingWindow();
        if (changed) {
            updateAllCharts();
            // Also density might change if many points drop off
            // updateChartDensity(chartData.labels.length); // Assuming this function exists elsewhere
        }
    }
}, 1000);

// Listen to sensor data changes and update charts
// Listen to new predictions (and fetch associated sensor data)
// This avoids the race condition where sensor_data exists but prediction is not yet written.
db.collection('predictions')
    .orderBy('timestamp', 'desc')
    .limit(1)
    .onSnapshot((snapshot) => {
        if (!snapshot.empty) {
            const pred = snapshot.docs[0].data();
            const predId = snapshot.docs[0].id;

            lastUpdateEl.textContent = new Date().toLocaleString();

            // Fetch corresponding sensor data
            db.collection('sensor_data')
                .doc(pred.sensor_data_id)
                .get()
                .then((sensorDoc) => {
                    if (sensorDoc.exists) {
                        const data = sensorDoc.data();

                        // Update charts with new data
                        updateCharts(data, pred.timestamp.toDate(), pred.failure_probability);

                        // Only update latest reading box if NOT paused
                        if (!isPaused) {
                            updateLatestReading(data, pred);
                        }
                    }
                })
                .catch(err => console.error("Error fetching sensor data for prediction:", err));
        }
    });

// Function to update the latest reading box
function updateLatestReading(sensorData, predictionData) {
    const timestamp = sensorData.timestamp.toDate().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    const probability = (predictionData.failure_probability * 100).toFixed(1);
    const riskClass = predictionData.failure_probability <= 0.3 ? 'low' :
        predictionData.failure_probability <= 0.8 ? 'medium' : 'high';

    // Update sensor values
    document.getElementById('latest-temp').textContent = `${sensorData.temperature.toFixed(1)}°C`;
    document.getElementById('latest-vib').textContent = `${sensorData.vibration.toFixed(3)} m/s²`;
    document.getElementById('latest-rpm').textContent = `${sensorData.rpm.toFixed(0)} rev/min`;

    // Update timestamp
    document.getElementById('latest-timestamp').textContent = timestamp;

    // Update risk prediction with color coding
    const riskValueEl = document.getElementById('latest-risk');
    riskValueEl.textContent = `${probability}%`;

    // Remove existing risk classes
    riskValueEl.classList.remove('risk-low', 'risk-medium', 'risk-high');
    // Add new risk class
    riskValueEl.classList.add(`risk-${riskClass}`);
}



// 4. Data History Limit Control
function loadHistoricalData() {
    // Clear existing data arrays in place to preserve Chart.js references
    chartData.labels.length = 0;
    chartData.temperature.length = 0;
    chartData.vibration.length = 0;
    chartData.rpm.length = 0;
    chartData.risk.length = 0;

    db.collection('sensor_data')
        .orderBy('timestamp', 'desc')
        .limit(parseInt(maxPoints))
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
                let latestData = null;
                let latestPred = null;

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

                        // Store the latest data (last one in chronological order)
                        latestData = data;
                        latestPred = pred;
                    }
                });

                // Update all charts
                temperatureChart.update();
                vibrationChart.update();
                rpmChart.update();
                riskChart.update();
                combinedChart.update();

                // Update latest reading box with most recent data (only if we have data)
                if (latestData && latestPred) {
                    updateLatestReading(latestData, latestPred);
                }
            });
        })
        .catch((error) => {
            console.error('Error loading historical data:', error);
        });
}

// Helper: Get duration in milliseconds
function getDurationInMillis() {
    let multiplier = 60 * 1000; // minutes
    if (currentTimeUnit === 'hours') multiplier = 60 * 60 * 1000;
    if (currentTimeUnit === 'days') multiplier = 24 * 60 * 60 * 1000;
    return currentTimeValue * multiplier;
}

// Helper: Downsample data to prevent crashes
function downsampleData(data, targetCount = 1000) {
    const length = data.length;
    if (length <= targetCount) return data;

    const step = Math.ceil(length / targetCount);
    const sampled = [];

    for (let i = 0; i < length; i += step) {
        sampled.push(data[i]);
    }

    console.log(`Downsampled from ${length} to ${sampled.length} points (Step: ${step})`);
    return sampled;
}

// Helper: Format time label based on duration
function formatTimeLabel(date) {
    const duration = getDurationInMillis();
    // Use seconds only if duration is very short (<= 5 minutes)
    const showSeconds = duration <= 5 * 60 * 1000;
    // Show date if duration is long (>= 24 hours)
    const showDate = duration >= 24 * 60 * 60 * 1000;

    if (showDate) {
        return date.toLocaleDateString('en-US', {
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }

    if (showSeconds) {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    }

    // Default: HH:MM
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}


// 4. Time-Based History Loading
function loadHistoricalData() {
    // Clear existing data arrays in place to preserve Chart.js references
    chartData.labels.length = 0;
    chartData.timestamps.length = 0;
    chartData.temperature.length = 0;
    chartData.vibration.length = 0;
    chartData.rpm.length = 0;
    chartData.risk.length = 0;

    const duration = getDurationInMillis();
    const startTime = new Date(Date.now() - duration);

    console.log(`Loading data since: ${startTime.toLocaleString()} (${currentTimeValue} ${currentTimeUnit})`);

    db.collection('sensor_data')
        .where('timestamp', '>', startTime)
        .orderBy('timestamp', 'desc')
        // No .limit() here, we fetch by time. 
        // WARNING: huge datasets might still be slow on fetch, 
        // but this is what the user requested (Hours/Days).
        .get()
        .then((snapshot) => {
            let historicalData = [];

            snapshot.forEach((doc) => {
                historicalData.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            // Reverse to get chronological order (Oldest -> Newest)
            historicalData.reverse();

            // Downsample if necessary
            historicalData = downsampleData(historicalData);

            // Fetch predictions for each sensor data point
            // Optimization: Fetch all predictions in range instead of N+1 queries
            // Since firestore 'IN' queries are limited, and we might have gap, 
            // for this prototype we will stick to 1:1 fetch but limited by downsampling.
            // However, doing 1000 requests is bad. 
            // IMPROVEMENT: Fetch predictions by time range too!

            return db.collection('predictions')
                .where('timestamp', '>', startTime)
                .orderBy('timestamp', 'asc') // Match chronological order
                .get()
                .then(predSnapshot => {
                    const predictionsMap = new Map();
                    predSnapshot.forEach(doc => {
                        const data = doc.data();
                        predictionsMap.set(data.sensor_data_id, data);
                    });

                    let latestData = null;
                    let latestPred = null;

                    historicalData.forEach(data => {
                        const pred = predictionsMap.get(data.id);

                        // Only add if we have paired data (or handle missing pred)
                        if (pred) {
                            const timeLabel = formatTimeLabel(new Date(data.timestamp.toDate()));

                            chartData.labels.push(timeLabel);
                            chartData.timestamps.push(data.timestamp.toDate().getTime());
                            chartData.temperature.push(data.temperature);
                            chartData.vibration.push(data.vibration);
                            chartData.rpm.push(data.rpm);
                            chartData.risk.push(pred.failure_probability * 100);

                            latestData = data;
                            latestPred = pred;
                        }
                    });

                    // Update density style based on final count
                    updateChartDensity(chartData.labels.length);

                    // Update all charts
                    temperatureChart.update();
                    vibrationChart.update();
                    rpmChart.update();
                    riskChart.update();
                    combinedChart.update();

                    // Update latest reading box with most recent data
                    if (latestData && latestPred) {
                        updateLatestReading(latestData, latestPred);
                    }
                });
        })
        .catch((error) => {
            console.error('Error loading historical data:', error);
            alert('Error loading data. If selecting "Days", the dataset might be too large for this prototype.');
        });
}

// Helper to optimize chart appearance based on data usage
function updateChartDensity(pointCount) {
    const isHighDensity = pointCount > 50;
    // Hide points for high density to reduce clutter, show them on hover
    const radius = isHighDensity ? 0 : 3;
    const hoverRadius = 6;

    const charts = [temperatureChart, vibrationChart, rpmChart, riskChart, combinedChart];

    charts.forEach(chart => {
        if (chart.options.elements && chart.options.elements.point) {
            chart.options.elements.point.radius = radius;
            chart.options.elements.point.hoverRadius = hoverRadius;
        } else {
            // Ensure options structure exists
            chart.options.elements = {
                point: {
                    radius: radius,
                    hoverRadius: hoverRadius
                }
            };
        }
        chart.update('none');
    });
}

applyTimeFilterBtn.addEventListener('click', () => {
    const val = parseInt(timeValueInput.value);
    if (val && val > 0) {
        currentTimeValue = val;
        currentTimeUnit = timeUnitSelect.value;
        loadHistoricalData();
    } else {
        alert('Please enter a valid time value.');
    }
});

// Initial Load
updateChartDensity(0); // Default input
loadHistoricalData();


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
                matchesRisk = probability <= 0.3;
            } else if (riskLevel === 'medium') {
                matchesRisk = probability > 0.3 && probability <= 0.8;
            } else if (riskLevel === 'high') {
                matchesRisk = probability > 0.8;
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
    const riskClass = predData.failure_probability <= 0.3 ? 'low' :
        predData.failure_probability <= 0.8 ? 'medium' : 'high';

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

        // Reset latest reading box
        document.getElementById('latest-temp').textContent = '--';
        document.getElementById('latest-vib').textContent = '--';
        document.getElementById('latest-rpm').textContent = '--';
        document.getElementById('latest-timestamp').textContent = 'No data yet';
        const riskValueEl = document.getElementById('latest-risk');
        riskValueEl.textContent = '--%';
        riskValueEl.classList.remove('risk-low', 'risk-medium', 'risk-high');

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

// ==========================================
// New Features Implementation
// ==========================================

// 1. Connection Status Management
function updateConnectionStatus(isOnline) {
    if (isOnline) {
        connectionStatusEl.classList.remove('offline');
        connectionStatusEl.classList.add('online');
        statusTextEl.textContent = 'System Online';
    } else {
        connectionStatusEl.classList.remove('online');
        connectionStatusEl.classList.add('offline');
        statusTextEl.textContent = 'Connection Lost';
    }
}

window.addEventListener('online', () => updateConnectionStatus(true));
window.addEventListener('offline', () => updateConnectionStatus(false));
// Initial check
updateConnectionStatus(navigator.onLine);


// 2. Pause/Resume Functionality
pauseBtn.addEventListener('click', () => {
    isPaused = !isPaused;

    if (isPaused) {
        pauseBtn.innerHTML = '▶️ Resume Updates';
        pauseBtn.classList.add('paused');
        pauseBtn.title = "Resume real-time updates (data is still being collected)";
    } else {
        pauseBtn.innerHTML = '⏸️ Pause Updates';
        pauseBtn.classList.remove('paused');
        pauseBtn.title = "Pause real-time updates";

        // Immediate refresh upon resume to show data collected while paused
        temperatureChart.update();
        vibrationChart.update();
        rpmChart.update();
        riskChart.update();
        combinedChart.update();
    }
});


// 3. Export to CSV Functionality
exportBtn.addEventListener('click', () => {
    if (allPredictions.length === 0) {
        alert('No data available to export.');
        return;
    }

    // CSV Headers
    const headers = ['Timestamp', 'Temperature (C)', 'Vibration (m/s2)', 'RPM', 'Failure Probability (%)', 'Risk Level'];

    // Map data to CSV rows
    const rows = allPredictions.map(item => {
        const timestamp = item.prediction.timestamp.toDate().toISOString();
        const temp = item.sensor.temperature.toFixed(2);
        const vib = item.sensor.vibration.toFixed(4);
        const rpm = item.sensor.rpm.toFixed(0);
        const prob = (item.prediction.failure_probability * 100).toFixed(2);

        let risk = 'Low';
        if (item.prediction.failure_probability > 0.8) risk = 'High';
        else if (item.prediction.failure_probability > 0.3) risk = 'Medium';

        return [timestamp, temp, vib, rpm, prob, risk].join(',');
    });

    // Combine headers and rows
    const csvContent = [headers.join(','), ...rows].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `motor_health_data_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});
