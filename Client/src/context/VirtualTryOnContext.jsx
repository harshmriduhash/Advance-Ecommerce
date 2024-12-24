import React, { createContext, useState, useRef, useEffect, useCallback } from "react";
import io from "socket.io-client";

const VirtualTryOnContext = createContext();

const socket = io("http://localhost:5000"); 

export const VirtualTryOnProvider = ({ children }) => {
    const [selectedImage, setSelectedImage] = useState(null); 
    const [webcamActive, setWebcamActive] = useState(false); 
    const [shirtImage, setShirtImage] = useState(null); 
    const webcamRef = useRef(null);
    
    useEffect(() => {
        socket.on("frame_processed", (data) => {
            setSelectedImage(`data:image/png;base64,${data.frame}`);
        });

        socket.on("error", (error) => {
            console.error("Error from server:", error.message);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    
    const blobToBase64 = (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(",")[1]); 
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    
    const handleImageClick = async (imageUrl) => {
        if (!webcamActive) {
            alert("Please enable the webcam to try on clothes.");
            return;
        }

        try {
            const shirtResponse = await fetch(imageUrl);
            const shirtBlob = await shirtResponse.blob();
            const shirtBase64 = await blobToBase64(shirtBlob);
            setShirtImage(shirtBase64);
        } catch (error) {
            console.error("Error loading shirt image:", error);
        }
    };


    const sendFrameToServer = useCallback(async () => {
        if (!webcamRef.current) return;

        const webcamCanvas = webcamRef.current.getCanvas();
        if (!webcamCanvas) return;

        const frameBlob = await new Promise((resolve) =>
            webcamCanvas.toBlob(resolve, "image/png")
        );
        const frameBase64 = await blobToBase64(frameBlob);

        socket.emit("process_frame", {
            frame: frameBase64,
            shirt: shirtImage,
        });
    }, [shirtImage]);

    // Webcam toggle
    const toggleWebcam = () => {
        setWebcamActive((prev) => !prev);
        setSelectedImage(null); 

        if (webcamRef.current && webcamRef.current.stream) {
            const tracks = webcamRef.current.stream.getTracks();
            tracks.forEach((track) => track.stop());
        }
    };

  
    useEffect(() => {
        if (webcamActive && shirtImage) {
            const interval = setInterval(sendFrameToServer, 1500);
            return () => clearInterval(interval);
        }
    }, [webcamActive, shirtImage, sendFrameToServer]);

    return (
        <VirtualTryOnContext.Provider
            value={{
                selectedImage,
                webcamActive,
                toggleWebcam,
                handleImageClick,
                webcamRef,
            }}
        >
            {children}
        </VirtualTryOnContext.Provider>
    );
};

export const useVirtualTryOn = () => React.useContext(VirtualTryOnContext);