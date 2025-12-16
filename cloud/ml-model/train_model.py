import pickle
import numpy as np
from sklearn.linear_model import LogisticRegression

# Generate synthetic training data
np.random.seed(42)
n_samples = 1000

# Normal operation: temp 20-40, vibration 0.01-0.05, rpm 1400-1600
normal_temp = np.random.uniform(20, 40, n_samples // 2)
normal_vib = np.random.uniform(0.01, 0.05, n_samples // 2)
normal_rpm = np.random.uniform(1400, 1600, n_samples // 2)
normal_labels = np.zeros(n_samples // 2)

# Failure conditions: high temp/vibration, abnormal rpm
failure_temp = np.random.uniform(45, 80, n_samples // 2)
failure_vib = np.random.uniform(0.08, 0.15, n_samples // 2)
failure_rpm = np.random.uniform(1200, 1300, n_samples // 2)
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

# Save model
with open("motor_model.pkl", "wb") as f:
    pickle.dump(model, f)

print("✓ Model trained and saved as motor_model.pkl")
print(f"  Training accuracy: {model.score(X, y):.2%}")
