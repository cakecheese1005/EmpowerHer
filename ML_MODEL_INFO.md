# ML Models Used in EmpowerHer

## Primary ML Model

### **XGBoost (Extreme Gradient Boosting)**
- **Model Type**: `XGBClassifier` (XGBoost Classification Model)
- **Library**: `xgboost==2.0.3`
- **Model File**: `basic_pcos_model.pkl`
- **Purpose**: PCOS Risk Classification

**What is XGBoost?**
- XGBoost is an advanced gradient boosting algorithm
- It builds multiple decision trees sequentially to improve predictions
- Excellent for classification tasks with structured data
- Provides feature importance for interpretability
- Handles missing values well

**Why XGBoost for PCOS Prediction?**
- Handles mixed data types (continuous, categorical)
- Provides probability scores (not just labels)
- Can handle missing values
- Fast prediction times
- Feature importance for explaining predictions

## Supporting Components

### **Scikit-learn Imputer**
- **Library**: `scikit-learn==1.4.0`
- **Component**: `SimpleImputer` or similar
- **Model File**: `basic_imputer.pkl`
- **Purpose**: Handles missing values in input features

**What does the Imputer do?**
- Fills in missing values before making predictions
- Uses statistical methods (mean, median, mode) to impute missing data
- Ensures the model receives complete feature vectors

### **Feature Engineering**
- **Model File**: `basic_features.pkl`
- **Purpose**: Stores expected feature names and order
- **Features Used** (10 features):
  1. Age (yrs)
  2. Weight (Kg)
  3. Height (Cm)
  4. BMI
  5. Cycle Regularity (Regular/Irregular)
  6. Cycle length (days)
  7. Skin darkening (Y/N)
  8. Fast food (Y/N)
  9. Regular Exercise (Y/N)
  10. Pregnant (Y/N)

## Model Output

The model predicts **3 risk categories**:
1. **No Risk** (Class 0)
2. **Early** (Class 1)
3. **High** (Class 2)

For each prediction, it provides:
- **Risk Label**: The predicted category
- **Probabilities**: Confidence scores for each category
- **Feature Importance**: Top contributing factors

## Model Architecture

```
Input Features (10 features)
    ↓
[Imputer] → Handles missing values
    ↓
[XGBoost Classifier] → Makes prediction
    ↓
Output: Risk Label + Probabilities + Feature Importance
```

## Model Files

Located in `ml_f/models/`:
- `basic_pcos_model.pkl` - Trained XGBoost model (169KB)
- `basic_imputer.pkl` - Scikit-learn imputer for missing values
- `basic_features.pkl` - Feature names and metadata
- `confusion_matrix_basic.csv` - Model performance metrics

## Technical Details

### Libraries Used:
- **XGBoost 2.0.3**: Main classification model
- **Scikit-learn 1.4.0**: Data preprocessing (imputation)
- **NumPy 1.26.3**: Numerical operations
- **Pandas 2.1.4**: Data handling

### Model Deployment:
- Deployed as a **FastAPI microservice**
- Runs on **Cloud Run** (Google Cloud Platform)
- Accessible via HTTP POST requests
- Endpoint: `/predict`

## Summary

**Main ML Algorithm**: ✅ **XGBoost (XGBClassifier)**
**Preprocessing**: ✅ **Scikit-learn Imputer**
**Other Models**: ❌ None (No Random Forest, SVM, KNN, etc.)

The application uses a single, well-trained XGBoost model for all PCOS risk predictions. XGBoost was chosen because it:
- Performs well on structured medical data
- Provides interpretable predictions
- Handles missing values effectively
- Offers fast inference times
- Produces probability scores (not just classifications)

