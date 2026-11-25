from dotenv import load_dotenv
from inference_sdk import InferenceHTTPClient

from flask import Flask, request, jsonify
from flask_cors import CORS


import numpy as np
from PIL import Image

import os
import uuid


# --------------------------------------------------
# APP SETUP
# --------------------------------------------------

app = Flask(__name__)
CORS(app)

load_dotenv()

os.makedirs("uploads", exist_ok=True)


# --------------------------------------------------
# ROBOFLOW CLIENT
# --------------------------------------------------

roboflow_client = InferenceHTTPClient(
    api_url="https://serverless.roboflow.com",
    api_key=os.getenv("ROBOFLOW_API_KEY")
)


# --------------------------------------------------
# OLD CNN MODEL
# --------------------------------------------------

# --------------------------------------------------
# ROBOFLOW PEST DETECTION
# --------------------------------------------------

@app.route("/predict", methods=["POST"])
def predict():

    try:

        # ------------------------------------------
        # CHECK IMAGE
        # ------------------------------------------

        if "image" not in request.files:
            return jsonify({
                "success": False,
                "error": "No image uploaded"
            }), 400

        file = request.files["image"]

        if file.filename == "":
            return jsonify({
                "success": False,
                "error": "No image selected"
            }), 400


        # ------------------------------------------
        # SAVE IMAGE
        # ------------------------------------------

        filename = f"{uuid.uuid4()}_{file.filename}"

        upload_path = os.path.join(
            "uploads",
            filename
        )

        file.save(upload_path)

        print("🔄 Sending image to Roboflow...")


        # ------------------------------------------
        # ROBOFLOW MODEL
        # ------------------------------------------

        result = roboflow_client.run_workflow(
    workspace_name="ankur-biswas",
    workflow_id="general-segmentation-api-9",
    images={
        "image": upload_path
    },
    parameters={
        "classes": "BROWN PLANTHOPPER, GREEN LEAFHOPPERS, LEAF FOLDERS, RICE BUGS, STEM BORER, WHORL MAGGOTS"
    },
    use_cache=False
)


        # ------------------------------------------
        # PRINT RESULT
        # ------------------------------------------

        print("========== ROBOFLOW RESULT ==========")
        print(result)
        print("=====================================")


        # ------------------------------------------
        # GET PREDICTIONS
        # ------------------------------------------

        predictions = result[0]["predictions"]["predictions"]

        print("PREDICTIONS:", predictions)

        detected_pests = []

        highest_confidence = 0.0


        for prediction in predictions:

            pest_class = prediction.get(
                "class",
                "Unknown"
            ).strip()


            confidence = float(
                prediction.get(
                    "confidence",
                    0
                )
            )

            detected_pests.append({
                "name": pest_class,
                "confidence": confidence
            })

            highest_confidence = max(
                highest_confidence,
                confidence
            )
            if highest_confidence > 1:
                highest_confidence = highest_confidence / 100


        # ------------------------------------------
        # DETECTION RESULT
        # ------------------------------------------

        pest_detected = len(detected_pests) > 0


        if pest_detected:

            pest_names = [
                pest["name"]
                for pest in detected_pests
            ]

            pest_text = ", ".join(pest_names)

            status = "⚠️ Pest Detected"

            cause = (
                f"Detected pest: {pest_text}"
            )

        else:

            status = "✅ Healthy"

            cause = (
                "No supported rice pest detected"
            )


        # ------------------------------------------
        # RESPONSE FOR REACT
        # ------------------------------------------

        response = {

            "success": True,

            "summary": {

                "has_disease": pest_detected,

                "status": status,

                "cause": cause,

                "confidence": (
                    f"{highest_confidence:.1%}"
                ),

                "symptoms_detected": (
                    pest_names
                    if pest_detected
                    else []
                )

            },

            "disease": {

                "name": (
                    detected_pests[0]["name"]
                    if pest_detected
                    else "No Pest Detected"
                ),

                "confidence": (
                    f"{highest_confidence:.1%}"
                ),

                "cause": cause,

                "likely_cause": (
                    "Pest infestation"
                    if pest_detected
                    else None
                ),

                "treatment": (
                    "Inspect the plant and remove or control the detected pest."
                    if pest_detected
                    else None
                )

            },

            "pests": detected_pests,

            "roboflow_result": result

        }


        return jsonify(response)


    # ------------------------------------------
    # ERROR HANDLING
    # ------------------------------------------

    except Exception as e:

        print("❌ Error:", str(e))

        return jsonify({

            "success": False,

            "error": str(e)

        }), 500


# --------------------------------------------------
# HEALTH CHECK
# --------------------------------------------------

@app.route("/health", methods=["GET"])
def health():

    return jsonify({

        "status": "running",

        "roboflow_model": "paddy-rice-pests/3",

        "disease_model": "loaded"

    })


# --------------------------------------------------
# START SERVER
# --------------------------------------------------

if __name__ == "__main__":

    app.run(
        debug=True,
        port=5000
    )