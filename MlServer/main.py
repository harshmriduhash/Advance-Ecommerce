# import os
# import cv2
# import mediapipe as mp
# import numpy as np
# from flask import Flask
# from flask_socketio import SocketIO, emit
# from werkzeug.utils import secure_filename
# from io import BytesIO
# import base64

# app = Flask(__name__)
# socketio = SocketIO(app, cors_allowed_origins="*")  # Enable WebSocket support with CORS

# # MediaPipe Pose Initialization
# mp_pose = mp.solutions.pose
# pose = mp_pose.Pose()
# mp_drawing = mp.solutions.drawing_utils

# # Function to overlay the shirt image on the frame
# def overlay_png(background, overlay, position):
#     bg_h, bg_w, bg_channels = background.shape
#     overlay_h, overlay_w, overlay_channels = overlay.shape

#     x, y = position

#     # Ensure the overlay doesn't go out of bounds
#     if x + overlay_w > bg_w:
#         overlay = overlay[:, :(bg_w - x)]
#     if y + overlay_h > bg_h:
#         overlay = overlay[:(bg_h - y), :]

#     alpha_s = overlay[:, :, 3] / 255.0
#     alpha_l = 1.0 - alpha_s

#     for c in range(0, 3):
#         background[y:y+overlay_h, x:x+overlay_w, c] = (
#             alpha_s * overlay[:, :, c] +
#             alpha_l * background[y:y+overlay_h, x:x+overlay_w, c]
#         )

#     return background

# # WebSocket to process real-time frames
# @socketio.on('process_frame')
# def process_frame(data):
#     try:
#         # Decode the frame and shirt image from base64
#         frame_data = base64.b64decode(data['frame'])
#         shirt_data = base64.b64decode(data['shirt'])

#         # Convert to numpy arrays
#         frame = cv2.imdecode(np.frombuffer(frame_data, np.uint8), cv2.IMREAD_COLOR)
#         shirt = cv2.imdecode(np.frombuffer(shirt_data, np.uint8), cv2.IMREAD_UNCHANGED)

#         if frame is None or shirt is None:
#             emit('error', {'message': 'Invalid frame or shirt data'})
#             return

#         # Process the frame for pose landmarks
#         img_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
#         results = pose.process(img_rgb)

#         if results.pose_landmarks:
#             landmarks = results.pose_landmarks.landmark
#             left_shoulder = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER]
#             right_shoulder = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER]

#             h, w, _ = frame.shape
#             left_shoulder_x = int(left_shoulder.x * w)
#             left_shoulder_y = int(left_shoulder.y * h)
#             right_shoulder_x = int(right_shoulder.x * w)
#             right_shoulder_y = int(right_shoulder.y * h)

#             shoulder_width = abs(left_shoulder_x - right_shoulder_x)

#             if shoulder_width > 0:
#                 shirt_width = int(shoulder_width * 1.6)
#                 shirt_height = int(shirt_width * shirt.shape[0] / shirt.shape[1])
#                 resized_shirt = cv2.resize(shirt, (shirt_width, shirt_height))

#                 shirt_position = (right_shoulder_x + (shoulder_width // 2) - (shirt_width // 2),
#                             right_shoulder_y - shirt_height // 8)

#                 frame = overlay_png(frame, resized_shirt, shirt_position)

#             else:
#                 emit('error', {'message': 'Invalid shoulder width'})
#                 return

#         # Encode the processed frame back to base64
#         _, buffer = cv2.imencode('.png', frame)
#         processed_frame = base64.b64encode(buffer).decode('utf-8')

#         # Send the processed frame back to the client
#         emit('frame_processed', {'frame': processed_frame})
#     except Exception as e:
#         emit('error', {'message': str(e)})

# if __name__ == '__main__':
#     socketio.run(app, debug=True, host='0.0.0.0', port=5000)
import os
import cv2
import mediapipe as mp
import numpy as np
from flask import Flask
from flask_socketio import SocketIO, emit
from werkzeug.utils import secure_filename
from io import BytesIO
import base64

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")  # Enable WebSocket support with CORS

# MediaPipe Pose Initialization
mp_pose = mp.solutions.pose
pose = mp_pose.Pose()
mp_drawing = mp.solutions.drawing_utils

# Function to overlay the shirt image on the frame
def overlay_png(background, overlay, position):
    bg_h, bg_w, bg_channels = background.shape
    overlay_h, overlay_w, overlay_channels = overlay.shape

    x, y = position

    # Ensure the overlay doesn't go out of bounds
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

# WebSocket to process real-time frames
@socketio.on('process_frame')
def process_frame(data):
    try:
        # Decode the frame and shirt image from base64
        frame_data = base64.b64decode(data['frame'])
        shirt_data = base64.b64decode(data['shirt'])

        # Convert to numpy arrays
        frame = cv2.imdecode(np.frombuffer(frame_data, np.uint8), cv2.IMREAD_COLOR)
        shirt = cv2.imdecode(np.frombuffer(shirt_data, np.uint8), cv2.IMREAD_UNCHANGED)

        if frame is None or shirt is None:
            emit('error', {'message': 'Invalid frame or shirt data'})
            return

        # Process the frame for pose landmarks
        img_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(img_rgb)

        if results.pose_landmarks:
            landmarks = results.pose_landmarks.landmark
            left_shoulder = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER]

            h, w, _ = frame.shape
            left_shoulder_x = int(left_shoulder.x * w)
            left_shoulder_y = int(left_shoulder.y * h)
            right_shoulder_x = int(right_shoulder.x * w)
            right_shoulder_y = int(right_shoulder.y * h)

            shoulder_width = abs(left_shoulder_x - right_shoulder_x)

            if shoulder_width > 0:
                shirt_width = int(shoulder_width * 1.6)
                shirt_height = int(shirt_width * shirt.shape[0] / shirt.shape[1])
                resized_shirt = cv2.resize(shirt, (shirt_width, shirt_height))

                shirt_position = (right_shoulder_x + (shoulder_width // 2) - (shirt_width // 2),
                            right_shoulder_y - shirt_height // 8)

                frame = overlay_png(frame, resized_shirt, shirt_position)

            else:
                emit('error', {'message': 'Invalid shoulder width'})
                return

        # Encode the processed frame back to base64
        _, buffer = cv2.imencode('.png', frame)
        processed_frame = base64.b64encode(buffer).decode('utf-8')

        # Send the processed frame back to the client
        emit('frame_processed', {'frame': processed_frame})
    except Exception as e:
        emit('error', {'message': str(e)})

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)