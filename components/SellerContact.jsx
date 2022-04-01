import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { Zocial } from "@expo/vector-icons";
import { COLORS } from "../variables/color";

const iconSize = 18;
const SellerContact = ({ onCall, onChat, onEmail, phone, email }) => {
  return (
    <View style={styles.container}>
      {phone && (
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#c8e6de" }]}
          onPress={onCall}
        >
          <FontAwesome name="phone" size={iconSize} color={COLORS.primary} />
          <Text style={[styles.btnText, { color: COLORS.primary }]}>Call</Text>
        </TouchableOpacity>
      )}
      {email && (
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#ffdbc4" }]}
          onPress={onEmail}
        >
          <Zocial name="email" size={iconSize} color={COLORS.orange} />
          <Text style={[styles.btnText, { color: COLORS.orange }]}>E-mail</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: "#c8e5f7" }]}
        onPress={onChat}
      >
        <Ionicons
          name="ios-chatbubbles"
          size={iconSize}
          color={COLORS.dodgerblue}
        />
        <Text style={[styles.btnText, { color: COLORS.dodgerblue }]}>Chat</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    marginHorizontal: "1%",
    paddingVertical: 8,
    borderRadius: 5,
  },
  btnText: {
    fontSize: iconSize,
    paddingLeft: 5,
    fontWeight: "bold",
  },
  container: {
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: "2%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    height: 60,
    bottom: 0,
    position: "absolute",
  },
});

export default SellerContact;
