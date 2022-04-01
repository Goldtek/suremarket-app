import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../variables/color";

const NoInternetScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.Text}>no internet</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bg_dark,
  },
});

export default NoInternetScreen;
