import pickle
import numpy as np
import os
from sklearn.ensemble import RandomForestClassifier

# Ensure we're saving in the ml-model directory
script_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(script_dir, "motor_model.pkl")

"""
Goal: ensure model probability responds to abnormal vibration/temperature
without any preprocessing (raw features only).
Approach:
1) Rebalance synthetic data so failures can occur at normal RPM when vib/temp are high,
    and add normal 'idle' samples at low RPM but with low vib/temp.
2) Use a tree ensemble (RandomForestClassifier) which is insensitive to feature scaling.
"""

# Generate synthetic training data
np.random.seed(42)

# --- Normal operation (running): temp 20-30°C, vib 0.3-0.6 m/s², rpm 2000-3000
n_run = 4000
normal_run_temp = np.random.uniform(20, 35, n_run)
normal_run_vib = np.random.uniform(0, 0.9, n_run)
normal_run_rpm = np.random.uniform(2000, 3000, n_run)
normal_run_labels = np.zeros(n_run)


# --- Failure A: high temp, normal RPM and VIB
n_fail_a = 1000
failure_a_temp = np.random.uniform(36, 90, n_fail_a)
failure_a_vib = np.random.uniform(0, 0.9, n_fail_a)
failure_a_rpm = np.random.uniform(2000, 3000, n_fail_a)
failure_a_labels = np.ones(n_fail_a)

# --- Failure B: high vib, normal RPM and TEMP
n_fail_b = 1000
failure_b_temp = np.random.uniform(20, 35, n_fail_b)
failure_b_vib = np.random.uniform(1.0, 9.0, n_fail_b)
failure_b_rpm = np.random.uniform(2000, 3000, n_fail_b)
failure_b_labels = np.ones(n_fail_b)

# --- Failure C: low RPM, normal TEMP and VIB
n_fail_c = 1000
failure_c_temp = np.random.uniform(20, 35, n_fail_c)
failure_c_vib = np.random.uniform(0, 0.9, n_fail_c)
failure_c_rpm = np.random.uniform(0, 1999, n_fail_c)
failure_c_labels = np.ones(n_fail_c)

# --- Failure D: All abnormal: high TEMP, high VIB, low RPM
n_fail_d = 1000
failure_d_temp = np.random.uniform(36, 90, n_fail_d)
failure_d_vib = np.random.uniform(1.0, 9.0, n_fail_d)
failure_d_rpm = np.random.uniform(0, 1999, n_fail_d)
failure_d_labels = np.ones(n_fail_d)

# Stack dataset
X = np.vstack([
    np.column_stack([normal_run_temp, normal_run_vib, normal_run_rpm]),
    np.column_stack([failure_a_temp, failure_a_vib, failure_a_rpm]),
    np.column_stack([failure_b_temp, failure_b_vib, failure_b_rpm]),
    np.column_stack([failure_c_temp, failure_c_vib, failure_c_rpm]),
    np.column_stack([failure_d_temp, failure_d_vib, failure_d_rpm])
])
y = np.concatenate([
    normal_run_labels,
    failure_a_labels,
    failure_b_labels,
    failure_c_labels,
    failure_d_labels
])

# Train model (no preprocessing)
model = RandomForestClassifier(
    n_estimators=300,
    max_depth=None,
    min_samples_split=4,
    min_samples_leaf=2,
    random_state=42,
)
model.fit(X, y)

# Save model in the same directory as this script
with open(model_path, "wb") as f:
    pickle.dump(model, f)

# Quick sanity checks: hold rpm/temperature fixed; increase vibration
sample_normal = np.array([[28.0, 0.4, 2300],
                          [40.0, 0.5, 2990],
                          [31.0, 1.5, 2100],
                          [31.0, 0.5, 1800],
                          [40.0, 1.5, 1800]])
prob = model.predict_proba(sample_normal)[:,1]
print(f"✓ Model trained and saved at: {model_path}")
print(f"{prob} ")
