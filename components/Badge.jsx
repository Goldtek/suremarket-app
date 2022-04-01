import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../variables/color";
import { FontAwesome } from "@expo/vector-icons";

const dataArr = ["is-top", "is-featured", "is-bump-up", "is-popular"];
const Badge = ({ badgeName, badgeStyle, badgeTextStyle, type }) => {
  const nameStr = badgeName.split("-").pop();
  const displayName =
    badgeName == "is-bump-up"
      ? "Bump up"
      : nameStr.charAt(0).toUpperCase() + nameStr.substring(1);

  if (dataArr.includes(badgeName)) {
    if (badgeName == "is-bump-up" && type == "card") {
      return (
        <View
          style={[
            styles.container,
            {
              backgroundColor: COLORS.badges[badgeName],
              borderRadius: 3,
              padding: 5,
            },
            badgeStyle,
          ]}
        >
          <FontAwesome name="clock-o" size={16} color={COLORS.white} />
        </View>
      );
    } else {
      return (
        <View
          style={[
            styles.container,
            {
              backgroundColor: COLORS.badges[badgeName],
              borderRadius: type == "card" ? 3 : 20,
              paddingVertical: 5,
              paddingHorizontal: type == "card" ? 5 : 15,
            },
            badgeStyle,
          ]}
        >
          <Text style={badgeTextStyle}>{displayName}</Text>
        </View>
      );
    }
  } else return null;
};

const styles = StyleSheet.create({
  container: {
    marginRight: 5,
    // borderRadius: 10,
  },
});

export default Badge;
