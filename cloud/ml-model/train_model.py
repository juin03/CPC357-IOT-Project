import pickle
import numpy as np
import os
from sklearn.linear_model import LogisticRegression

# Ensure we're saving in the ml-model directory
script_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(script_dir, "motor_model.pkl")

# Generate synthetic training data
np.random.seed(42)
n_samples = 2000

# Normal operation: room temp 20-30°C, vibration 0.3-0.6, rpm 2000-3000
normal_temp = np.random.uniform(20, 30, n_samples // 2)
normal_vib = np.random.uniform(0.3, 0.6, n_samples // 2)
normal_rpm = np.random.uniform(2000, 3000, n_samples // 2)
normal_labels = np.zeros(n_samples // 2)

# Failure conditions: high temp/vibration, abnormal rpm (too low)
failure_temp = np.random.uniform(35, 90, n_samples // 2)
failure_vib = np.random.uniform(0.7, 3, n_samples // 2)
failure_rpm = np.random.uniform(900, 1800, n_samples // 2)
failure_labels = np.ones(n_samples // 2)

# Combine data
X = np.vstack([
    np.column_stack([normal_temp, normal_vib, normal_rpm]),
    np.column_stack([failure_temp, failure_vib, failure_rpm])
])
y = np.concatenate([normal_labels, failure_labels])

# Train model
model = LogisticRegression()
model.fit(X, y)

# Save model in the same directory as this script
with open(model_path, "wb") as f:
    pickle.dump(model, f)

print(f"✓ Model trained and saved at: {model_path}")
print(f"  Training accuracy: {model.score(X, y):.2%}")
