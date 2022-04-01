import React from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { COLORS } from "../variables/color";
import { FontAwesome } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";

const TabScreenHeader = ({ right, onRightClick, style, left, onLeftClick }) => {
  return (
    <View style={[styles.container, style]}>
      <Image
        height={50}
        maxWidth="38%"
        resizeMode="contain"
        // eslint-disable-next-line no-undef
        source={require("../assets/logo_header.png")}
      />
      {right && (
        <TouchableOpacity style={styles.headerRight} onPress={onRightClick}>
          <FontAwesome name="refresh" size={20} color={COLORS.white} />
        </TouchableOpacity>
      )}
      {left && (
        <TouchableOpacity style={styles.headerLeft} onPress={onLeftClick}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  headerLeft: {
    position: "absolute",
    left: "2%",
  },
  headerRight: {
    position: "absolute",
    right: "6%",
  },
});

export default TabScreenHeader;
