import styled from "styled-components";
import { Container, Section } from "../../styles/styles";
import Title from "../common/Title";
import Slider from "react-slick";
import CustomNextArrow from "../common/CustomNextArrow";
import CustomPrevArrow from "../common/CustomPrevArrow";
import { newArrivalData } from "../../data/data";
import { commonCardStyles } from "../../styles/card";
import { breakpoints } from "../../styles/themes/default";

import Webcam from "react-webcam";
import io from "socket.io-client";
import React, { useState, useRef, useEffect } from "react";

const ProductCardBoxWrapper = styled.div`
  ${commonCardStyles}
  .product-img {
    height: 262px;
    width: 262px;
  }

  @media (max-width: ${breakpoints.sm}) {
    padding-left: 6px;
    padding-right: 6px;
  }
`;

const ArrivalSliderWrapper = styled.div`
  .custom-prev-arrow {
    top: 43%;
    left: -18px;
    @media (max-width: ${breakpoints.xxl}) {
      left: 24px;
    }

    @media (max-width: ${breakpoints.xs}) {
      left: 4px;
    }
  }

  .custom-next-arrow {
    top: 43%;
    right: -18px;
    @media (max-width: ${breakpoints.xxl}) {
      right: 24px;
    }

    @media (max-width: ${breakpoints.xs}) {
      right: 4px;
    }
  }
`;

const ButtonWrapper = styled.div`
background-color: #14c4b5; /* Initial color */
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;

  &:hover {
    background-color: #10b9b0; /* Lighter shade on hover */
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const WebcamContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 25rem;
  border: 2px solid #ccc;
  border-radius: 8px;
  background-color: #000;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
`;


const OverlayWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
`;

const OverlayImage = styled.img`
  max-width: 80%;
  max-height: 80%;
  transition: transform 0.3s ease-in-out;
  object-fit: contain;
`;


const socket = io("http://localhost:5000");

const NewArrival = () => {
  const [selectedImage, setSelectedImage] = useState(null); 
  const [webcamActive, setWebcamActive] = useState(false); 
  const webcamRef = useRef(null);
  const [shirtImage, setShirtImage] = useState(null); 
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
}, [webcamActive, shirtImage]);


  const settings = {
    dots: false,
    infinite: true,
    speed: 300,
    slidesToShow: 1,
    centerMode: true,
    variableWidth: true,
  };

  const path = [
    { id: 1, img: "/shirts/shirt2.png" },
    { id: 2, img: "/shirts/shirt1.png" },
    { id: 3, img: "/shirts/shirt3.png" },
  ];
  

  return (
    <Section>
      <Container>
        <Title titleText={"New Arrival"} />
        <ArrivalSliderWrapper>
          <Slider
            nextArrow={<CustomNextArrow />}
            prevArrow={<CustomPrevArrow />}
            {...settings}
          >
            {path?.map((newArrival) => {
              return (
                <ProductCardBoxWrapper key={newArrival.id}>
                  <div className="product-img">
                    <img
                      className="object-fit-cover"
                      src={newArrival.img}
                      alt="Product"
                      onClick={() => handleImageClick(newArrival.img)}
                    />
                  </div>
                </ProductCardBoxWrapper>
              );
            })}
          </Slider>
          <ButtonWrapper onClick={toggleWebcam}>
                    {webcamActive ? "Close Webcam" : "Open Webcam"}
                </ButtonWrapper>
        </ArrivalSliderWrapper>
        {webcamActive && (
  <>
    {/* Display the webcam feed */}
    <WebcamContainer>
    <Webcam
      audio={false}
      ref={webcamRef}
      screenshotFormat="image/png"
      videoConstraints={{ facingMode: "user" }}
      className="webcam-feed"
    />
    </WebcamContainer>

    {/* Display the virtual try-on image */}
    {selectedImage && (
   
      <div>
        <img src={selectedImage} alt="Virtual Try-On" className="overlay-image" />
      </div>
     
    )}
  </>
)}
      </Container>
    </Section>
  );
};

export default NewArrival;