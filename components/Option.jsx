import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { COLORS } from "../variables/color";

const Option = ({ title, icon, onPress, uri }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.option}>
        {uri && (
          <View
            style={{
              height: 20,
              width: 20,
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <Image
              source={uri}
              style={{
                height: "100%",
                width: "100%",
                resizeMode: "contain",
              }}
            />
          </View>
        )}
        <Text style={styles.optionTitle}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  option: {
    flexDirection: "row",
    paddingVertical: 12,
    backgroundColor: "#fff",
    marginHorizontal: 3,
    paddingHorizontal: "2.3%",
  },
  optionTitle: {
    fontWeight: "bold",
    color: COLORS.text_gray,
    paddingLeft: 10,
  },
  separator: {
    width: "auto",
    backgroundColor: COLORS.bg_dark,
    height: 2,
  },
});

export default Option;
