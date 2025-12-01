#!/usr/bin/env python3
"""
Comprehensive ML Model Comparison Script for PCOS Prediction
Trains multiple models and compares their performance metrics
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix
)

# Import all models to compare
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from xgboost import XGBClassifier

import pickle
import os
import json
from datetime import datetime

# Set random seed for reproducibility
RANDOM_STATE = 42
np.random.seed(RANDOM_STATE)

def load_and_prepare_data(csv_path='data/PCOS_cleaned_basic.csv'):
    """Load and prepare the PCOS dataset"""
    print(f"📊 Loading data from {csv_path}...")
    
    # Try to load the CSV file
    try:
        df = pd.read_csv(csv_path)
    except FileNotFoundError:
        # Try alternative paths
        alt_paths = [
            '../data/PCOS_cleaned_basic.csv',
            'data/PCOS_data.csv',
            '../data/PCOS_data.csv'
        ]
        df = None
        for path in alt_paths:
            try:
                df = pd.read_csv(path)
                csv_path = path
                break
            except:
                continue
        if df is None:
            raise FileNotFoundError(f"Could not find data file in any of: {csv_path}, {alt_paths}")
    
    print(f"✅ Loaded {len(df)} samples with {len(df.columns)} features")
    
    # The model expects 10 features based on main.py
    # 1. Age (yrs)
    # 2. Weight (Kg)
    # 3. Height(Cm)
    # 4. BMI
    # 5. Cycle(R/I) - 1=regular, 2=irregular
    # 6. Cycle length(days)
    # 7. Skin darkening (Y/N) - 1=Yes, 0=No
    # 8. Fast food (Y/N) - 1=Yes, 0=No
    # 9. Reg.Exercise(Y/N) - 1=Yes, 0=No
    # 10. Pregnant(Y/N) - 1=Yes, 0=No
    
    # Check if this is the cleaned dataset (has exact columns we need)
    required_features = ['Age (yrs)', 'Weight (Kg)', 'Height(Cm)', 'BMI', 'Cycle(R/I)', 
                        'Cycle length(days)', 'Skin darkening (Y/N)', 'Fast food (Y/N)', 
                        'Reg.Exercise(Y/N)', 'Pregnant(Y/N)']
    
    # Use cleaned dataset directly (simpler and cleaner)
    print("✅ Using cleaned dataset with exact feature columns")
    features_df = df[required_features].copy()
    
    # Convert to numeric (handle any string values)
    for col in features_df.columns:
        features_df[col] = pd.to_numeric(features_df[col], errors='coerce')
    
    # Target variable
    target = pd.to_numeric(df['PCOS (Y/N)'], errors='coerce').fillna(0).astype(int)
    
    # Remove any rows with NaN values (though cleaned dataset shouldn't have any)
    valid_mask = ~features_df.isnull().any(axis=1)
    features_df = features_df[valid_mask]
    target = target[valid_mask]
    
    if False:  # Keep old code for reference but skip it
        # Prepare features from raw dataset
        features_df = pd.DataFrame()
        
        # 1. Age
        features_df['Age'] = pd.to_numeric(df.get('Age (yrs)', df.get(' Age (yrs)', 0)), errors='coerce')
        
        # 2. Weight
        features_df['Weight'] = pd.to_numeric(df.get('Weight (Kg)', df.get('Weight (Kg)', 0)), errors='coerce')
        
        # 3. Height
        height_col = df.get('Height(Cm) ', df.get('Height(Cm)', df.get('Height (Cm)', 0)))
        features_df['Height'] = pd.to_numeric(height_col, errors='coerce')
        
        # 4. BMI - calculate if not present
        if 'BMI' in df.columns:
            features_df['BMI'] = pd.to_numeric(df['BMI'], errors='coerce')
        else:
            features_df['BMI'] = features_df['Weight'] / ((features_df['Height'] / 100) ** 2)
        
        # 5. Cycle Regularity (1=regular, 2=irregular)
        cycle_col = df.get('Cycle(R/I)', df.get('Cycle (R/I)', 2))
        features_df['Cycle_Regularity'] = pd.to_numeric(cycle_col, errors='coerce').fillna(2)
        
        # 6. Cycle length
        cycle_len_col = df.get('Cycle length(days)', df.get('Cycle length (days)', 0))
        features_df['Cycle_Length'] = pd.to_numeric(cycle_len_col, errors='coerce').fillna(0)
        
        # 7. Skin darkening (1=Yes, 0=No)
        skin_col = df.get('Skin darkening (Y/N)', df.get('Skin darkening', 0))
        features_df['Skin_Darkening'] = pd.to_numeric(skin_col, errors='coerce').fillna(0).astype(int)
        
        # 8. Fast food (1=Yes, 0=No)
        fastfood_col = df.get('Fast food (Y/N)', df.get('Fast food', 0))
        features_df['Fast_Food'] = pd.to_numeric(fastfood_col, errors='coerce').fillna(0).astype(int)
        
        # 9. Regular Exercise (1=Yes, 0=No)
        exercise_col = df.get('Reg.Exercise(Y/N)', df.get('Reg.Exercise', 0))
        features_df['Regular_Exercise'] = pd.to_numeric(exercise_col, errors='coerce').fillna(0).astype(int)
        
        # 10. Pregnant (1=Yes, 0=No)
        pregnant_col = df.get('Pregnant(Y/N)', df.get('Pregnant', 0))
        features_df['Pregnant'] = pd.to_numeric(pregnant_col, errors='coerce').fillna(0).astype(int)
        
        # Target variable (PCOS: 0=No, 1=Yes)
        target = pd.to_numeric(df.get('PCOS (Y/N)', df.get('PCOS', 0)), errors='coerce').fillna(0).astype(int)
        
        # Rename columns to match expected format
        if 'Cycle_Regularity' in features_df.columns:
            features_df.columns = required_features
    
    # Remove rows with too many missing values
    initial_rows = len(features_df)
    features_df = features_df.dropna(thresh=7)  # Keep if at least 7 features present
    target = target.loc[features_df.index]
    
    print(f"📋 After cleaning: {len(features_df)} samples (removed {initial_rows - len(features_df)} with too many missing values)")
    
    return features_df, target

def train_and_evaluate_model(model, name, X_train, X_test, y_train, y_test, scaler=None):
    """Train a model and return evaluation metrics"""
    print(f"\n🔧 Training {name}...")
    
    try:
        # Scale features for models that need it
        if scaler and name in ['SVM', 'KNN', 'Logistic Regression']:
            X_train_scaled = scaler.fit_transform(X_train)
            X_test_scaled = scaler.transform(X_test)
        else:
            X_train_scaled = X_train
            X_test_scaled = X_test
        
        # Handle missing values with imputation
        imputer = SimpleImputer(strategy='median')
        X_train_imputed = imputer.fit_transform(X_train_scaled)
        X_test_imputed = imputer.transform(X_test_scaled)
        
        # Train model
        model.fit(X_train_imputed, y_train)
        
        # Predict
        y_pred = model.predict(X_test_imputed)
        
        # Calculate metrics
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred, average='weighted', zero_division=0)
        recall = recall_score(y_test, y_pred, average='weighted', zero_division=0)
        f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)
        
        # Class-specific metrics for binary classification
        if len(np.unique(y_test)) == 2:
            precision_binary = precision_score(y_test, y_pred, zero_division=0)
            recall_binary = recall_score(y_test, y_pred, zero_division=0)
            f1_binary = f1_score(y_test, y_pred, zero_division=0)
        else:
            precision_binary = precision
            recall_binary = recall
            f1_binary = f1
        
        # Confusion matrix
        cm = confusion_matrix(y_test, y_pred)
        
        print(f"✅ {name} trained successfully")
        print(f"   Accuracy: {accuracy:.4f}")
        print(f"   Precision: {precision:.4f}")
        print(f"   Recall: {recall:.4f}")
        print(f"   F1-Score: {f1:.4f}")
        
        return {
            'model': model,
            'imputer': imputer,
            'scaler': scaler,
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1_score': f1,
            'precision_binary': precision_binary,
            'recall_binary': recall_binary,
            'f1_binary': f1_binary,
            'confusion_matrix': cm.tolist(),
            'classification_report': classification_report(y_test, y_pred, output_dict=True)
        }
    except Exception as e:
        print(f"❌ Error training {name}: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

def main():
    """Main function to train and compare all models"""
    print("=" * 80)
    print("🚀 PCOS Prediction Model Comparison")
    print("=" * 80)
    
    # Load data
    try:
        X, y = load_and_prepare_data()
    except Exception as e:
        print(f"❌ Error loading data: {e}")
        print("\nTrying alternative data file...")
        try:
            X, y = load_and_prepare_data('data/PCOS_cleaned_basic.csv')
        except Exception as e2:
            print(f"❌ Error: {e2}")
            return
    
    print(f"\n📈 Dataset Summary:")
    print(f"   Features: {X.shape[1]}")
    print(f"   Samples: {X.shape[0]}")
    print(f"   PCOS Cases: {y.sum()} ({y.sum()/len(y)*100:.1f}%)")
    print(f"   No PCOS: {(y==0).sum()} ({(y==0).sum()/len(y)*100:.1f}%)")
    
    # Split data
    print(f"\n🔄 Splitting data into train/test sets (80/20)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_STATE, stratify=y
    )
    print(f"   Training set: {len(X_train)} samples")
    print(f"   Test set: {len(X_test)} samples")
    
    # Initialize scaler for models that need it
    scaler = StandardScaler()
    
    # Define all models to compare
    models = {
        'XGBoost': XGBClassifier(
            random_state=RANDOM_STATE,
            eval_metric='mlogloss',
            use_label_encoder=False
        ),
        'Random Forest': RandomForestClassifier(
            n_estimators=100,
            random_state=RANDOM_STATE,
            max_depth=10
        ),
        'Gradient Boosting': GradientBoostingClassifier(
            n_estimators=100,
            random_state=RANDOM_STATE,
            max_depth=5,
            learning_rate=0.1
        ),
        'Logistic Regression': LogisticRegression(
            random_state=RANDOM_STATE,
            max_iter=1000,
            solver='lbfgs'
        ),
        'SVM': SVC(
            random_state=RANDOM_STATE,
            kernel='rbf',
            probability=True,
            C=1.0,
            gamma='scale'
        ),
        'KNN': KNeighborsClassifier(
            n_neighbors=5,
            weights='distance'
        )
    }
    
    # Train and evaluate all models
    results = {}
    
    for name, model in models.items():
        result = train_and_evaluate_model(
            model, name, X_train, X_test, y_train, y_test,
            scaler=scaler if name in ['SVM', 'KNN', 'Logistic Regression'] else None
        )
        if result:
            results[name] = result
    
    # Create comparison dataframe
    print("\n" + "=" * 80)
    print("📊 MODEL COMPARISON RESULTS")
    print("=" * 80)
    
    comparison_data = []
    for name, result in results.items():
        comparison_data.append({
            'Model': name,
            'Accuracy': f"{result['accuracy']:.4f}",
            'Precision': f"{result['precision']:.4f}",
            'Recall': f"{result['recall']:.4f}",
            'F1-Score': f"{result['f1_score']:.4f}",
            'Precision (Binary)': f"{result['precision_binary']:.4f}",
            'Recall (Binary)': f"{result['recall_binary']:.4f}",
            'F1 (Binary)': f"{result['f1_binary']:.4f}"
        })
    
    comparison_df = pd.DataFrame(comparison_data)
    print("\n" + comparison_df.to_string(index=False))
    
    # Find best model
    best_model_name = max(results.items(), key=lambda x: x[1]['f1_score'])[0]
    print(f"\n🏆 BEST MODEL: {best_model_name}")
    print(f"   F1-Score: {results[best_model_name]['f1_score']:.4f}")
    print(f"   Accuracy: {results[best_model_name]['accuracy']:.4f}")
    
    # Save results to CSV
    output_dir = 'models'
    os.makedirs(output_dir, exist_ok=True)
    
    comparison_df.to_csv(f'{output_dir}/model_comparison_results.csv', index=False)
    print(f"\n💾 Results saved to {output_dir}/model_comparison_results.csv")
    
    # Save detailed results to JSON
    detailed_results = {}
    for name, result in results.items():
        detailed_results[name] = {
            'accuracy': float(result['accuracy']),
            'precision': float(result['precision']),
            'recall': float(result['recall']),
            'f1_score': float(result['f1_score']),
            'precision_binary': float(result['precision_binary']),
            'recall_binary': float(result['recall_binary']),
            'f1_binary': float(result['f1_binary']),
            'confusion_matrix': result['confusion_matrix'],
            'classification_report': result['classification_report']
        }
    
    with open(f'{output_dir}/detailed_comparison_results.json', 'w') as f:
        json.dump(detailed_results, f, indent=2)
    
    print(f"💾 Detailed results saved to {output_dir}/detailed_comparison_results.json")
    
    # Save all trained models
    print(f"\n💾 Saving trained models...")
    for name, result in results.items():
        model_filename = f"{output_dir}/{name.lower().replace(' ', '_')}_model.pkl"
        try:
            with open(model_filename, 'wb') as f:
                pickle.dump({
                    'model': result['model'],
                    'imputer': result['imputer'],
                    'scaler': result.get('scaler'),
                    'metrics': {
                        'accuracy': result['accuracy'],
                        'precision': result['precision'],
                        'recall': result['recall'],
                        'f1_score': result['f1_score']
                    }
                }, f)
            print(f"   ✅ {name} saved to {model_filename}")
        except Exception as e:
            print(f"   ❌ Error saving {name}: {e}")
    
    # Create a summary report
    report = f"""
# ML Model Comparison Report
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Dataset Information
- Total Samples: {len(X)}
- Training Samples: {len(X_train)}
- Test Samples: {len(X_test)}
- Features: {X.shape[1]}
- PCOS Cases: {y.sum()} ({y.sum()/len(y)*100:.1f}%)
- No PCOS: {(y==0).sum()} ({(y==0).sum()/len(y)*100:.1f}%)

## Model Performance Comparison

{comparison_df.to_markdown(index=False)}

## Best Model
**{best_model_name}** achieved the highest F1-Score of {results[best_model_name]['f1_score']:.4f}

## Detailed Results
See `detailed_comparison_results.json` for confusion matrices and classification reports.
"""
    
    with open(f'{output_dir}/COMPARISON_REPORT.md', 'w') as f:
        f.write(report)
    
    print(f"\n📄 Full report saved to {output_dir}/COMPARISON_REPORT.md")
    print("\n" + "=" * 80)
    print("✅ Model comparison completed successfully!")
    print("=" * 80)

if __name__ == "__main__":
    main()

