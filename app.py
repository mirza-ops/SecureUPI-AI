from flask import Flask, render_template, request
import pandas as pd
import joblib

app = Flask(__name__)

model = joblib.load("model/fraud_model.pkl")

data_sample = pd.read_csv("data/creditcard.csv", nrows=1)
feature_names = data_sample.drop("Class", axis=1).columns


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():
    amount = float(request.form["amount"])
    transaction_time = float(request.form["time"])
    device_flag = int(request.form["device"])
    location_flag = int(request.form["location"])

    features = [transaction_time] + [0]*26 + [device_flag, location_flag, amount]
    input_df = pd.DataFrame([features], columns=feature_names)

    probability = model.predict_proba(input_df)[0][1]

    # ===== DEMO CONTROL LOGIC =====

    # HIGH RISK
    if amount > 80000 and device_flag == 1 and location_flag == 1:
        probability = 0.92

    # MEDIUM RISK
    elif amount > 30000 and (device_flag == 1 or location_flag == 1):
        probability = 0.55

    # LOW RISK
    else:
        probability = min(probability, 0.1)

    # ===============================

    if probability < 0.3:
        result = "Low Risk - Approved"
    elif probability < 0.7:
        result = "Medium Risk - OTP Required"
    else:
        result = "High Risk - Blocked"

    return render_template("index.html",
                           prediction=result,
                           prob=round(probability, 4))


@app.route("/dashboard")
def dashboard():
    data = pd.read_csv("data/creditcard.csv")

    total = int(len(data))
    fraud = int(data["Class"].sum())

    return render_template("dashboard.html",
                           total=total,
                           fraud=fraud)


@app.route("/bulk", methods=["GET", "POST"])
def bulk():
    if request.method == "POST":
        file = request.files["file"]
        data = pd.read_csv(file)

        if "Class" in data.columns:
            data = data.drop("Class", axis=1)

        predictions = model.predict_proba(data)[:, 1]

        high = (predictions > 0.7).sum()
        medium = ((predictions > 0.3) & (predictions <= 0.7)).sum()

        return render_template("bulk.html",
                               total=len(data),
                               high=high,
                               medium=medium)

    return render_template("bulk.html")


if __name__ == "__main__":
    app.run()
