
# ML Model Comparison Report
Generated: 2025-12-01 04:13:04

## Dataset Information
- Total Samples: 541
- Training Samples: 432
- Test Samples: 109
- Features: 10
- PCOS Cases: 177 (32.7%)
- No PCOS: 364 (67.3%)

## Model Performance Comparison

| Model               |   Accuracy |   Precision |   Recall |   F1-Score |   Precision (Binary) |   Recall (Binary) |   F1 (Binary) |
|:--------------------|-----------:|------------:|---------:|-----------:|---------------------:|------------------:|--------------:|
| XGBoost             |     0.8257 |      0.823  |   0.8257 |     0.8237 |               0.7576 |            0.6944 |        0.7246 |
| Random Forest       |     0.7615 |      0.7533 |   0.7615 |     0.7528 |               0.6786 |            0.5278 |        0.5938 |
| Gradient Boosting   |     0.8073 |      0.8031 |   0.8073 |     0.8014 |               0.7586 |            0.6111 |        0.6769 |
| Logistic Regression |     0.8349 |      0.8322 |   0.8349 |     0.8306 |               0.8    |            0.6667 |        0.7273 |
| SVM                 |     0.7798 |      0.7756 |   0.7798 |     0.7662 |               0.75   |            0.5    |        0.6    |
| KNN                 |     0.8349 |      0.8322 |   0.8349 |     0.8306 |               0.8    |            0.6667 |        0.7273 |

## Best Model
**Logistic Regression** achieved the highest F1-Score of 0.8306

## Detailed Results
See `detailed_comparison_results.json` for confusion matrices and classification reports.
