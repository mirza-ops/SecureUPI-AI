from flask import Flask, render_template, request
import pandas as pd
import joblib

app = Flask(__name__)

# Load trained model
model = joblib.load("model/fraud_model.pkl")


# =========================================================
# MODEL FEATURE NAMES
# =========================================================

feature_names = [
    "Time",
    "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9",
    "V10", "V11", "V12", "V13", "V14", "V15", "V16", "V17",
    "V18", "V19", "V20", "V21", "V22", "V23", "V24", "V25",
    "V26", "V27", "V28",
    "Amount"
]


# =========================================================
# BULK SCAN SETTINGS
# =========================================================

MAX_BULK_ROWS = 10000
BATCH_SIZE = 2000


# =========================================================
# HOME
# =========================================================

@app.route("/")
def home():
    return render_template("index.html")


# =========================================================
# SINGLE TRANSACTION PREDICTION
# =========================================================

@app.route("/predict", methods=["POST"])
def predict():

    try:
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

        # =================================================
        # DEMO RISK CONTROL LOGIC
        # =================================================

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

        # =================================================
        # RESULT
        # =================================================

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

    except Exception as e:
        return render_template(
            "index.html",
            prediction="Invalid transaction data",
            prob=0
        )


# =========================================================
# DASHBOARD
# =========================================================

@app.route("/dashboard")
def dashboard():

    # Demo statistics from the original dataset.
    # No external CSV is required.
    total = 284807
    fraud = 492

    return render_template(
        "dashboard.html",
        total=total,
        fraud=fraud
    )


# =========================================================
# BULK CSV SCANNER
# =========================================================

@app.route("/bulk", methods=["GET", "POST"])
def bulk():

    if request.method == "GET":
        return render_template("bulk.html")

    file = request.files.get("file")

    if not file or file.filename == "":
        return render_template(
            "bulk.html",
            error="Please select a CSV file."
        )

    try:

        # -------------------------------------------------
        # Read CSV in batches
        # -------------------------------------------------

        csv_reader = pd.read_csv(
            file,
            chunksize=BATCH_SIZE
        )

        total = 0
        high = 0
        medium = 0
        low = 0

        first_chunk = True

        for data in csv_reader:

            # ---------------------------------------------
            # Check total row limit
            # ---------------------------------------------

            total += len(data)

            if total > MAX_BULK_ROWS:
                return render_template(
                    "bulk.html",
                    error=(
                        f"CSV is too large. "
                        f"Maximum allowed is {MAX_BULK_ROWS:,} rows."
                    )
                )

            # ---------------------------------------------
            # Remove target column if present
            # ---------------------------------------------

            if "Class" in data.columns:
                data = data.drop("Class", axis=1)

            # ---------------------------------------------
            # Validate required columns
            # ---------------------------------------------

            if first_chunk:

                missing_columns = [
                    column
                    for column in feature_names
                    if column not in data.columns
                ]

                if missing_columns:
                    return render_template(
                        "bulk.html",
                        error=(
                            "CSV format is incorrect. "
                            "Missing required model columns."
                        )
                    )

                first_chunk = False

            # ---------------------------------------------
            # Keep only model features
            # ---------------------------------------------

            data = data[feature_names]

            # ---------------------------------------------
            # Predict current batch
            # ---------------------------------------------

            predictions = model.predict_proba(data)[:, 1]

            # ---------------------------------------------
            # Count risk levels
            # ---------------------------------------------

            high += int((predictions > 0.7).sum())

            medium += int(
                (
                    (predictions > 0.3)
                    & (predictions <= 0.7)
                ).sum()
            )

            low += int(
                (predictions <= 0.3).sum()
            )

        # -------------------------------------------------
        # Empty CSV protection
        # -------------------------------------------------

        if total == 0:
            return render_template(
                "bulk.html",
                error="The uploaded CSV is empty."
            )

        # -------------------------------------------------
        # Return results
        # -------------------------------------------------

        return render_template(
            "bulk.html",
            total=total,
            high=high,
            medium=medium,
            low=low
        )

    except pd.errors.EmptyDataError:

        return render_template(
            "bulk.html",
            error="The uploaded CSV is empty."
        )

    except Exception as e:

        return render_template(
            "bulk.html",
            error="Unable to process this CSV file. Please check its format."
        )


# =========================================================
# LOCAL DEVELOPMENT
# =========================================================

if __name__ == "__main__":
    app.run()
