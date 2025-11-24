#!/usr/bin/env python3
"""
Seed Firestore with sample data from PCOS_data.csv
Run with: python scripts/seed_firestore.py
"""

import csv
import json
import sys
from datetime import datetime
from firebase_admin import initialize_app, credentials, firestore
import os

# Initialize Firebase Admin
if not os.path.exists("serviceAccountKey.json"):
    print("ERROR: serviceAccountKey.json not found. Please download it from Firebase Console.")
    print("Place it in the project root directory.")
    sys.exit(1)

cred = credentials.Certificate("serviceAccountKey.json")
initialize_app(cred)
db = firestore.client()

def parse_csv_row(row):
    """Parse a CSV row and convert to assessment format"""
    try:
        # Map CSV columns to our assessment schema
        age = int(row.get("Age (yrs)", 0) or 0)
        weight = float(row.get("Weight (Kg)", 0) or 0)
        height = float(row.get("Height(Cm) ", 0) or 0)
        cycle_regularity = "irregular" if row.get("Cycle(R/I)", "").strip() == "2" else "regular"
        
        # Exercise frequency mapping
        exercise_val = row.get("Reg.Exercise(Y/N)", "").strip()
        if exercise_val == "0":
            exercise_frequency = "none"
        elif exercise_val == "1":
            exercise_frequency = "3-4_week"
        else:
            exercise_frequency = "1-2_week"
        
        # Diet mapping
        fast_food = row.get("Fast food (Y/N)", "").strip() == "1"
        diet = "unhealthy" if fast_food else "balanced"
        
        # PCOS label
        pcos_label = row.get("PCOS (Y/N)", "").strip()
        risk_label = "High" if pcos_label == "1" else "No Risk"
        
        # Calculate BMI
        bmi = weight / ((height / 100) ** 2) if height > 0 else 0
        
        assessment = {
            "age": age,
            "weight": weight,
            "height": height,
            "bmi": round(bmi, 2),
            "cycleRegularity": cycle_regularity,
            "exerciseFrequency": exercise_frequency,
            "diet": diet,
            "weightGain": row.get("Weight gain(Y/N)", "").strip() == "1",
            "hairGrowth": row.get("hair growth(Y/N)", "").strip() == "1",
            "skinDarkening": row.get("Skin darkening (Y/N)", "").strip() == "1",
            "hairLoss": row.get("Hair loss(Y/N)", "").strip() == "1",
            "pimples": row.get("Pimples(Y/N)", "").strip() == "1",
        }
        
        # Add optional lab values if available
        if row.get("FSH(mIU/mL)"):
            try:
                assessment["fsh"] = float(row.get("FSH(mIU/mL)"))
            except:
                pass
        
        if row.get("LH(mIU/mL)"):
            try:
                assessment["lh"] = float(row.get("LH(mIU/mL)"))
            except:
                pass
        
        # Create mock result
        result = {
            "label": risk_label,
            "probabilities": {
                "NoRisk": 0.1 if risk_label == "High" else 0.7,
                "Early": 0.2,
                "High": 0.7 if risk_label == "High" else 0.1,
            },
            "topContributors": [
                {
                    "feature": "BMI",
                    "contribution": 0.3 if bmi > 25 else 0.1,
                    "explanation": "BMI contributes to PCOS risk assessment."
                },
                {
                    "feature": "Cycle Regularity",
                    "contribution": 0.4 if cycle_regularity == "irregular" else 0.1,
                    "explanation": "Irregular cycles are a key indicator."
                },
            ]
        }
        
        return assessment, result
    except Exception as e:
        print(f"Error parsing row: {e}")
        return None, None

def seed_firestore(csv_path="ml_f/data/PCOS_data.csv", num_samples=50):
    """Seed Firestore with sample data"""
    print(f"Reading data from {csv_path}...")
    
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    
    print(f"Found {len(rows)} rows. Seeding {min(num_samples, len(rows))} samples...")
    
    # Create demo users
    users_ref = db.collection("users")
    assessments_ref = db.collection("assessments")
    
    demo_users = []
    for i in range(min(10, num_samples // 5)):
        user_id = f"demo_user_{i+1}"
        user_data = {
            "email": f"demo{i+1}@empowerher.app",
            "displayName": f"Demo User {i+1}",
            "createdAt": firestore.SERVER_TIMESTAMP,
        }
        users_ref.document(user_id).set(user_data)
        demo_users.append(user_id)
        print(f"Created user: {user_id}")
    
    # Create assessments
    assessments_created = 0
    for i, row in enumerate(rows[:num_samples]):
        assessment, result = parse_csv_row(row)
        if not assessment:
            continue
        
        user_id = demo_users[i % len(demo_users)]
        assessment_data = {
            "userId": user_id,
            "input": assessment,
            "result": result,
            "createdAt": firestore.SERVER_TIMESTAMP,
        }
        
        assessments_ref.add(assessment_data)
        assessments_created += 1
        
        if (i + 1) % 10 == 0:
            print(f"Created {assessments_created} assessments...")
    
    print(f"\n✅ Seeding complete!")
    print(f"   - Users created: {len(demo_users)}")
    print(f"   - Assessments created: {assessments_created}")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Seed Firestore with sample data")
    parser.add_argument("--samples", type=int, default=50, help="Number of samples to seed")
    parser.add_argument("--csv", type=str, default="ml_f/data/PCOS_data.csv", help="Path to CSV file")
    args = parser.parse_args()
    
    seed_firestore(args.csv, args.samples)

