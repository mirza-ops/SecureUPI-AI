from flask import Flask, render_template, request
import pandas as pd
import joblib

app = Flask(__name__)

# Load trained model
model = joblib.load("model/fraud_model.pkl")

# Credit Card Fraud dataset feature names
# Class is the target column, so there are 30 input features.
feature_names = [
    "Time",
    "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9",
    "V10", "V11", "V12", "V13", "V14", "V15", "V16", "V17",
    "V18", "V19", "V20", "V21", "V22", "V23", "V24", "V25",
    "V26", "V27", "V28",
    "Amount"
]


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():

    amount = float(request.form["amount"])
    transaction_time = float(request.form["time"])
    device_flag = int(request.form["device"])
    location_flag = int(request.form["location"])

    # Create 30 model features
    features = [
        transaction_time
    ] + [0] * 26 + [
        device_flag,
        location_flag,
        amount
    ]

    input_df = pd.DataFrame(
        [features],
        columns=feature_names
    )

    probability = model.predict_proba(input_df)[0][1]

    # ===== DEMO RISK CONTROL LOGIC =====

    # HIGH RISK
    if amount > 80000 and device_flag == 1 and location_flag == 1:
        probability = 0.92

    # MEDIUM RISK
    elif amount > 30000 and (
        device_flag == 1 or location_flag == 1
    ):
        probability = 0.55

    # LOW RISK
    else:
        probability = min(probability, 0.1)

    # ====================================

    if probability < 0.3:
        result = "Low Risk - Approved"

    elif probability < 0.7:
        result = "Medium Risk - OTP Required"

    else:
        result = "High Risk - Blocked"

    return render_template(
        "index.html",
        prediction=result,
        prob=round(probability, 4)
    )


@app.route("/dashboard")
def dashboard():

    # Dashboard demo statistics.
    # No external dataset is required for deployment.
    total = 284807
    fraud = 492

    return render_template(
        "dashboard.html",
        total=total,
        fraud=fraud
    )


@app.route("/bulk", methods=["GET", "POST"])
def bulk():

    if request.method == "POST":

        file = request.files["file"]

        if not file:
            return render_template("bulk.html")

        data = pd.read_csv(file)

        # Remove target column if uploaded CSV contains it
        if "Class" in data.columns:
            data = data.drop("Class", axis=1)

        # Make sure columns match the trained model
        missing_columns = [
            column for column in feature_names
            if column not in data.columns
        ]

        if missing_columns:
            return render_template(
                "bulk.html",
                error="CSV format is incorrect. Missing required columns."
            )

        # Keep only model features in correct order
        data = data[feature_names]

        predictions = model.predict_proba(data)[:, 1]

        high = int((predictions > 0.7).sum())

        medium = int(
            ((predictions > 0.3) &
             (predictions <= 0.7)).sum()
        )

        low = int(
            (predictions <= 0.3).sum()
        )

        return render_template(
            "bulk.html",
            total=len(data),
            high=high,
            medium=medium,
            low=low
        )

    return render_template("bulk.html")


if __name__ == "__main__":
    app.run()
