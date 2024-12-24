import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import io from "socket.io-client";

const socket = io("http://localhost:5000"); // Connect to the WebSocket server

const VirtualTryOn = () => {
    const [selectedImage, setSelectedImage] = useState(null); // Stores processed image
    const [webcamActive, setWebcamActive] = useState(false); // Toggles webcam
    const webcamRef = useRef(null);
    const [shirtImage, setShirtImage] = useState(null); // Stores selected shirt image

    useEffect(() => {
        if (!socket) return;

        // Handle processed frame data from the server
        socket.on("frame_processed", (data) => {
            setSelectedImage(`data:image/png;base64,${data.frame}`);
        });

        socket.on("error", (error) => {
            console.error("Error from server:", error.message);
        });

        // Cleanup on component unmount
        return () => {
            socket.disconnect();
        };
    }, []);

    const handleImageClick = async (imageUrl) => {
        if (!webcamActive) {
            alert("Please enable the webcam to try on clothes.");
            return;
        }

        try {
            const shirtResponse = await fetch(imageUrl);
            const shirtBlob = await shirtResponse.blob();
            const shirtBase64 = await blobToBase64(shirtBlob);
            setShirtImage(shirtBase64); // Update the selected shirt image
        } catch (error) {
            console.error("Error loading shirt image:", error);
        }
    };

    const sendFrameToServer = async () => {
        if (!webcamRef.current) return;

        const webcamCanvas = webcamRef.current.getCanvas();
        if (!webcamCanvas) return;

        // Convert webcam frame to Base64
        const frameBlob = await new Promise((resolve) =>
            webcamCanvas.toBlob(resolve, "image/png")
        );
        const frameBase64 = await blobToBase64(frameBlob);

        // Send frame and shirt to the server
        socket.emit("process_frame", {
            frame: frameBase64,
            shirt: shirtImage,
        });
    };

    const blobToBase64 = (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(",")[1]); // Extract Base64
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const toggleWebcam = () => {
        setWebcamActive((prev) => !prev);
        setSelectedImage(null); // Reset the image when toggling the webcam

        // Stop the webcam stream when disabling
        if (webcamRef.current && webcamRef.current.stream) {
            const tracks = webcamRef.current.stream.getTracks();
            tracks.forEach((track) => track.stop());
        }
    };

    useEffect(() => {
        // Send frames periodically when webcam is active
        if (webcamActive && shirtImage) {
            const interval = setInterval(sendFrameToServer, 1500); // Send frame every 100ms
            return () => clearInterval(interval);
        }
    }, [webcamActive, shirtImage]); // Re-run when webcam or shirtImage changes

    return (
        <div className="virtual-try-on">
            <div className="shirt-selection">
                <h2>Choose a Shirt:</h2>
                {/* Example shirt images */}
                <img
                    src="/shirts/shirt1.png"
                    alt="Shirt 1"
                    onClick={() => handleImageClick("/shirts/shirt1.png")}
                />
                <img
                    src="/shirts/shirt2.png"
                    alt="Shirt 2"
                    onClick={() => handleImageClick("/shirts/shirt2.png")}
                />
            </div>

            <div className="webcam-container">
                <button onClick={toggleWebcam}>
                    {webcamActive ? "Close Webcam" : "Open Webcam"}
                </button>

                {webcamActive && (
  <>
    {/* Display the webcam feed */}
    <Webcam
      audio={false}
      ref={webcamRef}
      screenshotFormat="image/png"
      videoConstraints={{ facingMode: "user" }}
      className="webcam-feed"
    />
    
    {/* Display the virtual try-on image */}
    {selectedImage && (
      <div className="overlay">
        <img src={selectedImage} alt="Virtual Try-On" className="overlay-image" />
      </div>
    )}
  </>
)}

            </div>
        </div>
    );
};

export default VirtualTryOn;
