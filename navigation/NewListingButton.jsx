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
              backgroundColor: "#F16B59",
              borderRadius: 30,
              height: 60,
              justifyContent: "center",
              width: 60,            
            }}
          >
            <FontAwesome5 name="cart-plus" size={20} color="#fff" />
            
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
    backgroundColor: "#FBFBFB",
    borderRadius: 40,
    height: 90,
    justifyContent: "center",
    width: 90,
    marginBottom: 20
  },
});

export default NewListingButton;
