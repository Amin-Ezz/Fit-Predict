"""
FitPredict Multi-Target Neural Network Service
Multi-Layer Perceptron trained for:
1. Daily Protein Requirement (g/day & g/kg)
2. Daily Hydration & Electrolyte Requirement (Liters/day & mg/day)
3. Daily Recommended Physical Activity (Minutes/day & Workout Focus)
"""

import os
import joblib
import numpy as np
from sklearn.neural_network import MLPRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, root_mean_squared_error, mean_absolute_error

MODEL_FILE = os.path.join(os.path.dirname(__file__), 'mlp_cardio_model.joblib')

FEATURE_NAMES = [
    'age',
    'gender', # 1 for male, 0 for female
    'height_cm',
    'weight_kg',
    'training_experience_years',
    'weekly_sessions',
    'avg_session_minutes',
    'avg_sleep_hours',
    'rpe_intensity',
    'resting_heart_rate'
]

TARGET_NAMES = [
    'daily_protein_g',
    'daily_water_l',
    'daily_electrolytes_mg',
    'daily_activity_mins'
]

def generate_synthetic_athletic_cohort(n_samples=3000, random_state=42):
    """
    Generates realistic biometric cohort grounded in ISSN (International Society of Sports Nutrition),
    ACSM guidelines, and human hydration/sweat rate physiology.
    """
    rng = np.random.RandomState(random_state)
    
    age = rng.uniform(18, 65, n_samples)
    gender = rng.choice([0, 1], n_samples, p=[0.45, 0.55]) # 1: male, 0: female
    height_cm = rng.normal(175, 9, n_samples)
    weight_kg = rng.normal(74, 12, n_samples)
    experience = rng.exponential(3.0, n_samples)
    sessions = rng.randint(1, 8, n_samples)
    duration = rng.uniform(30, 110, n_samples)
    sleep = rng.normal(7.3, 1.1, n_samples)
    rpe = rng.uniform(3, 9.5, n_samples)
    rhr = rng.normal(62, 8, n_samples)

    # 1. Daily Protein Requirement (ISSN Guidelines: 1.4 - 2.4 g/kg bodyweight)
    # Higher training frequency and RPE intensity increase muscle protein breakdown and protein needs.
    # Sleep deprivation (<7h) stimulates cortisol and catabolism, requiring additional protein support.
    protein_multiplier = (
        1.45
        + (0.08 * (rpe - 4))
        + (0.05 * (sessions - 3))
        + (0.04 * np.clip(experience - 2, 0, 5))
        + (0.06 * np.maximum(0, 7.0 - sleep))
        + rng.normal(0, 0.04, n_samples)
    )
    protein_multiplier = np.clip(protein_multiplier, 1.35, 2.45)
    daily_protein_g = np.round(weight_kg * protein_multiplier, 1)

    # 2. Daily Water Intake (35ml/kg baseline + exercise sweat rate replenishment)
    # Average sweat loss is 0.5 to 1.2 L per hour of moderate to intense exercise.
    daily_workout_fraction = (sessions * duration) / (7.0 * 60.0) # hours of workout per day
    sweat_loss_daily = daily_workout_fraction * (0.65 + (rpe / 12.0) * 0.45)
    baseline_water = weight_kg * 0.035
    water_noise = rng.normal(0, 0.15, n_samples)
    daily_water_l = np.clip(np.round(baseline_water + sweat_loss_daily + water_noise, 2), 2.0, 6.0)

    # 3. Daily Electrolytes (Sodium, Potassium, Magnesium - mg/day)
    # Standard baseline ~2,300mg sodium + ~3,500mg potassium.
    # Sweat sodium concentration: ~800-1100 mg per liter of sweat.
    electrolyte_baseline = 2400.0 + (gender * 150.0)
    electrolyte_sweat_add = sweat_loss_daily * 950.0
    electrolyte_noise = rng.normal(0, 75, n_samples)
    daily_electrolytes_mg = np.clip(np.round(electrolyte_baseline + electrolyte_sweat_add + electrolyte_noise, 0), 2200, 5500)

    # 4. Daily Recommended Physical Activity (Minutes/day)
    # ACSM & WHO target: 150-300 min/week moderate, or 75-150 min/week vigorous.
    # Personalized by athlete recovery capacity (sleep, resting heart rate, training history).
    base_activity = 42.0 + (experience * 1.8) - ((rhr - 60) * 0.3) + ((sleep - 7.0) * 2.2) + (rpe * 1.1)
    activity_noise = rng.normal(0, 3.0, n_samples)
    daily_activity_mins = np.clip(np.round(base_activity + activity_noise, 0), 30, 85)

    X = np.column_stack([
        age, gender, height_cm, weight_kg, experience,
        sessions, duration, sleep, rpe, rhr
    ])
    y = np.column_stack([
        daily_protein_g,
        daily_water_l,
        daily_electrolytes_mg,
        daily_activity_mins
    ])
    
    return X, y

from sklearn.compose import TransformedTargetRegressor

def train_and_export_model():
    """Trains the Multi-Output MLPRegressor pipeline and saves evaluation metrics."""
    X, y = generate_synthetic_athletic_cohort()
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('mlp', TransformedTargetRegressor(
            regressor=MLPRegressor(
                hidden_layer_sizes=(128, 64, 32),
                activation='relu',
                solver='adam',
                alpha=0.005,
                learning_rate_init=0.005,
                max_iter=600,
                random_state=42
            ),
            transformer=StandardScaler()
        ))
    ])

    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    r2_raw = r2_score(y_test, y_pred, multioutput='raw_values')
    r2 = r2_score(y_test, y_pred)
    rmse = root_mean_squared_error(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)

    evaluation = {
        'test_r2': round(float(r2), 3),
        'target_r2_scores': {
            'protein_r2': round(float(r2_raw[0]), 3),
            'water_r2': round(float(r2_raw[1]), 3),
            'electrolytes_r2': round(float(r2_raw[2]), 3),
            'activity_r2': round(float(r2_raw[3]), 3)
        },
        'test_rmse': round(float(rmse), 2),
        'test_mae': round(float(mae), 2),
        'model_version': 'v2.0.0-multi-target-mlp',
        'architecture': 'StandardScaler + TransformedTargetRegressor(MLPRegressor(128, 64, 32))',
        'features': FEATURE_NAMES,
        'targets': TARGET_NAMES
    }

    joblib.dump({'pipeline': pipeline, 'evaluation': evaluation}, MODEL_FILE)
    print(f"Model saved to {MODEL_FILE} | Overall R2: {r2:.3f} | Protein R2: {r2_raw[0]:.3f}, Water R2: {r2_raw[1]:.3f}, Electrolytes R2: {r2_raw[2]:.3f}, Activity R2: {r2_raw[3]:.3f}")
    return pipeline, evaluation

def load_or_train_model():
    if os.path.exists(MODEL_FILE):
        try:
            data = joblib.load(MODEL_FILE)
            if 'targets' in data.get('evaluation', {}):
                return data['pipeline'], data['evaluation']
        except Exception:
            pass
    return train_and_export_model()

class CardiorespiratoryPredictor:
    """Predictor for Protein, Hydration/Electrolytes, and Recommended Physical Activity."""
    def __init__(self):
        self.pipeline, self.evaluation = load_or_train_model()

    def predict_features(self, feature_dict):
        gender_val = 1 if str(feature_dict.get('gender', 'male')).lower() in ['male', 'مرد', '1'] else 0
        weight_kg = float(feature_dict.get('weight_kg', 74))
        
        feature_vector = np.array([[
            float(feature_dict.get('age', 28)),
            gender_val,
            float(feature_dict.get('height_cm', 178)),
            weight_kg,
            float(feature_dict.get('training_experience_years', 3)),
            float(feature_dict.get('weekly_sessions', 4)),
            float(feature_dict.get('avg_session_minutes', 60)),
            float(feature_dict.get('avg_sleep_hours', 7.5)),
            float(feature_dict.get('rpe_intensity', 7)),
            float(feature_dict.get('resting_heart_rate', 60))
        ]])

        predictions = self.pipeline.predict(feature_vector)[0]
        protein_g = round(float(predictions[0]), 1)
        water_l = round(float(predictions[1]), 2)
        electrolytes_mg = int(round(float(predictions[2])))
        activity_mins = int(round(float(predictions[3])))

        protein_g_per_kg = round(protein_g / max(1.0, weight_kg), 2)
        per_meal_g = round(protein_g / 4.0, 1)

        return {
            'is_demo': False,
            'prediction_id': 'nn_' + os.urandom(4).hex(),
            'protein': {
                'name': 'نیاز روزانه به پروتئین',
                'daily_grams': protein_g,
                'g_per_kg': protein_g_per_kg,
                'per_meal_recommendation': f'{per_meal_g} گرم در هر وعده (۴ وعده)',
                'tier': 'بهینه برای ترمیم و رشد عضلانی',
                'description': 'منطبق با پروتکل‌های تغذیه ورزشی ISSN بر اساس وزن و شدت تمرین'
            },
            'hydration': {
                'name': 'نیاز روزانه به آب و الکترولیت',
                'water_liters': water_l,
                'electrolytes_mg': electrolytes_mg,
                'tier': 'توازن هیدراتاسیون و اسمولاریته سلولی',
                'description': f'مصرف {water_l} لیتر آب همراه با {electrolytes_mg:,} میلی‌گرم الکترولیت جهت پیشگیری از افت توان عضلانی'
            },
            'activity': {
                'name': 'میزان فعالیت ورزشی روزانه پیشنهادی',
                'daily_minutes': activity_mins,
                'weekly_hours': round((activity_mins * 7) / 60.0, 1),
                'workout_focus': 'ترکیب تمرین مقاومتی با وهله‌های هوازی Zone 2',
                'description': f'هدف‌گذاری {activity_mins} دقیقه در روز جهت بهبود عملکرد بدون خطر بیش‌تمرینی'
            },
            'model_metadata': self.evaluation
        }

if __name__ == '__main__':
    train_and_export_model()
