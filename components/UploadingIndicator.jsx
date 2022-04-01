import React from "react";
import LottieView from "lottie-react-native";

const UploadingIndicator = ({ onDone }) => {
  // if (!visible) return null;
  return (
    <LottieView
      autoPlay
      loop={true}
      // eslint-disable-next-line no-undef
      source={require("../assets/animations/uploading.json")}
      onAnimationFinish={onDone}
    />
  );
};

export default UploadingIndicator;
