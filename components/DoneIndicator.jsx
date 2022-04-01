import React from "react";
import LottieView from "lottie-react-native";

const DoneIndicator = ({ visible = false, onDone }) => {
  if (!visible) return null;
  return (
    <LottieView
      autoPlay
      loop={false}
      // eslint-disable-next-line no-undef
      source={require("../assets/animations/uploading_done.json")}
      onAnimationFinish={onDone}
    />
  );
};

export default DoneIndicator;
