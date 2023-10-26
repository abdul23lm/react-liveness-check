import React, { useState, useRef } from "react";
import Switch from "react-switch";
import ImageUpload from "./components/ImageUpload";
import "./App.css";

function App() {
  const appId = import.meta.env.VITE_APP_ID;
  const apiKey = import.meta.env.VITE_API_KEY;
  const apiUrl = import.meta.env.VITE_API_URL;

  const [selectedOption, setSelectedOption] = useState("");

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageUploaded, setImageUploaded] = useState(false);

  const [webcamActive, setWebcamActive] = useState(false);
  const videoRef = useRef(null);

  const [isRequesting, setIsRequesting] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const [apiResponse, setApiResponse] = useState<string | null>("");
  const [isQuality, setIsQuality] = useState(true);
  const [isAttribute, setIsAttribute] = useState(true);
  const [validateQuality, setValidateQuality] = useState(true);
  const [validateAttribute, setValidateAttribute] = useState(true);
  const [validateNFace, setValidateNFace] = useState(true);

  let livenessResponse = null;

  if (apiResponse) {
    try {
      livenessResponse = JSON.parse(apiResponse);
    } catch (error) {
      console.error("Error parsing API response:", error);
    }
  }
  const livenessProbability = livenessResponse?.liveness?.probability || "N/A";

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
    handleReset();
  };

  const handleImageUpload = (base64Image: string) => {
    setUploadedImage(base64Image);
    setImageUploaded(true);
  };

  const activateWebcam = async () => {
    try {
      setWebcamActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      videoRef.current.srcObject = stream;
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Error activating webcam:", error);
    }
  };

  const handleCloseModal = () => {
    if (webcamActive) {
      const mediaStream = videoRef.current.srcObject;

      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => {
          track.stop();
        });
      }
      setWebcamActive(false);
    }
  };

  const captureWebcamPhoto = async () => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext("2d");

      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const base64Image = canvas.toDataURL("image/jpeg");

        setUploadedImage(base64Image);

        setImageUploaded(true);
        handleCloseModal();
      } else {
        console.error("Canvas context is not available.");
      }
    } catch (error) {
      console.error("An error occurred during image capture:", error);
    }
  };

  const handleAPIRequest = async () => {
    setIsRequesting(true);
    const requestOptions = {
      method: "POST",
      headers: {
        accept: "application/json",
        "App-ID": appId,
        "API-Key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        is_quality: isQuality,
        is_attribute: isAttribute,
        validate_quality: validateQuality,
        validate_attribute: validateAttribute,
        validate_nface: validateNFace,
        image: uploadedImage,
      }),
    };

    try {
      const response = await fetch(apiUrl, requestOptions);
      const data = await response.json();
      setApiResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setApiResponse("Error occurred during the API request.");
    }
    setIsRequesting(false);
    setIsDisabled(true);
  };

  const handleReset = () => {
    setUploadedImage(null);
    setImageUploaded(false);
    setIsRequesting(false);
    setApiResponse(null);
    setIsQuality(true);
    setIsAttribute(true);
    setValidateQuality(true);
    setValidateAttribute(true);
    setValidateNFace(true);
    setIsDisabled(false);
    setWebcamActive(false);
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {webcamActive && (
        <div className="webcam-modal bg-white p-5">
          <div className="video-container">
            <video ref={videoRef} autoPlay />
          </div>
          <div className="flex justify-center mb-4">
            <button
              className="mx-2 mt-5 w-full bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg outline-none"
              onClick={handleCloseModal}
            >
              Batal
            </button>
            <button
              className="mx-2 mt-5 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg outline-none"
              onClick={captureWebcamPhoto}
            >
              Capture
            </button>
          </div>
        </div>
      )}

      <h1 className="text-4xl font-bold mb-4">Liveness Check</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        <div className="col-span-1 p-4">
          <h1 className="text-2xl font-bold mb-4">Conditions</h1>
          <div className="mb-4 flex justify-between items-center">
            <label className="mr-2 text-left">
              <b>1. Use Quality Check:</b> <br />
              <small className="text-gray-300">
                A flag to determine whether Image Quality (blur, dark,
                grayscale) will be computed and return as result
              </small>
            </label>
            <Switch
              onChange={(checked) => setIsQuality(checked)}
              checked={isQuality}
            />
          </div>
          <div className="mb-4 flex justify-between items-center">
            <label className="mr-2 text-left">
              <b>2. Use Attribute:</b>
              <br />
              <small className="text-gray-300">
                A flag to determine whether Image Attribute (sunglasses, mask,
                veil) will be detected and return as result
              </small>
            </label>
            <Switch
              onChange={(checked) => setIsAttribute(checked)}
              checked={isAttribute}
            />
          </div>
          <div className="mb-4 flex justify-between items-center">
            <label className="mr-2 text-left">
              <b>3. Validate Quality:</b>
              <br />
              <small className="text-gray-300">
                Determines whether Quality validation will be executed. The
                validation consists of checking blur and dark with threshold,
                and also checking whether the image is a black & white image
                (grayscale is true). It is highly recommended to set
                validate_quality to true as Liveness is influenced by Quality.
              </small>
            </label>
            <Switch
              onChange={(checked) => setValidateQuality(checked)}
              checked={validateQuality}
            />
          </div>
          <div className="mb-4 flex justify-between items-center">
            <label className="mr-2 text-left">
              <b>4. Validate Attribute:</b> <br />
              <small className="text-gray-300">
                Determines whether Attribute validation will be executed. The
                validation consists of checking whether sunglasses or mask is
                detected in the input image.
              </small>
            </label>
            <Switch
              onChange={(checked) => setValidateAttribute(checked)}
              checked={validateAttribute}
            />
          </div>
          <div className="mb-4 flex justify-between items-center">
            <label className="mr-2 text-left">
              <b>5. Validate NFace: </b>
              <br />
              <small className="text-gray-300">
                Determines whether the number of faces validation will be
                executed. The validation checks whether the input image consists
                of more than one face.
              </small>
            </label>
            <Switch
              onChange={(checked) => setValidateNFace(checked)}
              checked={validateNFace}
            />
          </div>
        </div>
        <div className="col-span-1 p-4">
          <h1 className="text-2xl font-bold mb-4">Image</h1>
          <div className="mb-4">
            <select
              value={selectedOption}
              onChange={handleOptionChange}
              className="w-full py-3 px-3 rounded"
            >
              <option value="">Choose Source</option>
              <option value="upload">Upload</option>
              <option value="selfie">Selfie</option>
            </select>
          </div>
          <div className="mb-8">
            {selectedOption === "upload" && (
              <div className="mb-8">
                <ImageUpload onImageUpload={handleImageUpload} />
              </div>
            )}
            {selectedOption === "selfie" && (
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg mb-4 w-full outline-none"
                onClick={activateWebcam}
              >
                Activate Webcam
              </button>
            )}
          </div>
          {uploadedImage && (
            <img
              src={uploadedImage}
              alt="Uploaded"
              className="w-full h-auto rounded-lg"
            />
          )}
        </div>

        <div className="col-span-1 p-4">
          <h1 className="text-2xl font-bold mb-4">API Response</h1>
          <button
            onClick={handleAPIRequest}
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg mb-4 w-full outline-none ${
              !imageUploaded ? "disabled-button" : ""
            }`}
            disabled={!imageUploaded || isRequesting || isDisabled}
          >
            {isRequesting ? "Loading..." : "Perform Liveness Check"}
          </button>
          {apiResponse && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h1 className="text-2xl font-bold my-4">
                Liveness: {livenessProbability}%
              </h1>
              <pre className="text-left whitespace-pre-wrap">
                {JSON.stringify(JSON.parse(apiResponse), null, 2)}
              </pre>
              <button
                onClick={handleReset}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg mt-4 w-full outline-none"
              >
                Reset
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
