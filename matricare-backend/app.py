from flask import Flask, request, jsonify
import joblib
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load model
model = joblib.load("risk_model.pkl")

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json

    features = [[
        data['age'],
        data['bp'],
        data['dbp'],
        data['bs'],
        data['temp'],
        data['hr']
    ]]

    prediction = model.predict(features)[0]
    probs = model.predict_proba(features)[0]
    confidence = max(probs)

    risk_map = {
        0: "Low",
        1: "Medium",
        2: "High"
    }

    return jsonify({
        "risk": risk_map[prediction],
        "confidence": float(confidence)
    })

if __name__ == "__main__":
    app.run(debug=True)