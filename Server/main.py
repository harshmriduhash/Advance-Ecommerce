import cv2
import mediapipe as mp
import os
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import StreamingResponse
import numpy as np
from io import BytesIO
from PIL import Image

# FastAPI app initialization
app = FastAPI()

# MediaPipe setup
mp_pose = mp.solutions.pose
pose = mp_pose.Pose()
mp_drawing = mp.solutions.drawing_utils

# Shirt image setup
shirtFolderPath = "Resources/Shirts"
listShirts = os.listdir(shirtFolderPath)
shirtImagePath = os.path.join(shirtFolderPath, listShirts[0])
shirtImage = cv2.imread(shirtImagePath, cv2.IMREAD_UNCHANGED)

# Function to overlay images
def overlay_png(background, overlay, position):
    bg_h, bg_w, bg_channels = background.shape
    overlay_h, overlay_w, overlay_channels = overlay.shape

    x, y = position

    if x + overlay_w > bg_w:
        overlay = overlay[:, :(bg_w - x)]
    if y + overlay_h > bg_h:
        overlay = overlay[:(bg_h - y), :]

    alpha_s = overlay[:, :, 3] / 255.0
    alpha_l = 1.0 - alpha_s

    for c in range(0, 3):
        background[y:y+overlay_h, x:x+overlay_w, c] = (
            alpha_s * overlay[:, :, c] +
            alpha_l * background[y:y+overlay_h, x:x+overlay_w, c]
        )

    return background

# Endpoint to receive image, process it, and overlay the shirt
@app.post("/try-on")
async def try_on(file: UploadFile = File(...)):
    # Read the uploaded image file
    img_bytes = await file.read()
    img = Image.open(BytesIO(img_bytes))
    img = np.array(img)

    # Convert image to RGB (needed for MediaPipe)
    imgRGB = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    results = pose.process(imgRGB)

    if results.pose_landmarks:
        landmarks = results.pose_landmarks.landmark
        left_shoulder = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER]
        right_shoulder = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER]

        h, w, _ = img.shape
        left_shoulder_x = int(left_shoulder.x * w)
        left_shoulder_y = int(left_shoulder.y * h)
        right_shoulder_x = int(right_shoulder.x * w)
        right_shoulder_y = int(right_shoulder.y * h)

        shoulder_width = left_shoulder_x - right_shoulder_x

        if shoulder_width > 0:
            shirt_width = int(shoulder_width * 1.6)
            shirt_height = int(shirt_width * shirtImage.shape[0] / shirtImage.shape[1])

            resized_shirt = cv2.resize(shirtImage, (shirt_width, shirt_height))

            shirt_position = (right_shoulder_x + (shoulder_width // 2) - (shirt_width // 2),
                              right_shoulder_y - shirt_height // 8)

            img = overlay_png(img, resized_shirt, shirt_position)

        else:
            return {"message": "Invalid shoulder width"}

    # Convert the processed image to bytes for response
    _, img_encoded = cv2.imencode('.png', img)
    img_bytes = img_encoded.tobytes()

    return StreamingResponse(BytesIO(img_bytes), media_type="image/png")

# Run the server with:
# uvicorn main:app --reload