import React from "react";
import {
  View,
  StyleSheet,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { COLORS } from "../variables/color";
import { useStateValue } from "../StateProvider";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

const NewListingButton = ({ onPress }) => {
  const [{ newListingScreen, user }] = useStateValue();
  return (
    <View
      style={newListingScreen && user ? styles.buttonHidden : styles.button}
    >
      <TouchableWithoutFeedback onPress={onPress}>
        <View style={styles.content}>
          <View
            style={{
              alignItems: "center",
              backgroundColor: "#ffbc8f",
              borderRadius: 19,
              height: 38,
              justifyContent: "center",
              width: 38,
            }}
          >
            <View
              style={{
                alignItems: "center",
                backgroundColor: "#ff6600",
                borderRadius: 13,
                height: 26,
                justifyContent: "center",
                width: 26,
              }}
            >
              <FontAwesome5 name="plus" size={15} color="#fff" />
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    bottom: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    height: 60,
    width: 60,
    borderRadius: 30,
  },
  buttonHidden: {
    alignItems: "center",
  },
  buttonTitle: {
    textTransform: "uppercase",
    fontSize: 9,
  },

  content: {
    alignItems: "center",
    backgroundColor: "#ffe0cc",
    borderRadius: 25,
    height: 50,
    justifyContent: "center",
    width: 50,
  },
});

export default NewListingButton;
