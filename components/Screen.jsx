import React, { useState, useEffect } from "react";
import Constants from "expo-constants";
import { StyleSheet, SafeAreaView, View, Text } from "react-native";
import { COLORS } from "../variables/color";
import { useNetInfo } from "@react-native-community/netinfo";
import { useStateValue } from "../StateProvider";

const noInternetText = "Connection Error! Please check internet connection.";

const Screen = ({ children, style }) => {
  const [, dispatch] = useStateValue();
  const [initial, setInitial] = useState(true);
  const netInfo = useNetInfo();

  useEffect(() => {
    if (initial && !netInfo.isInternetReachable) {
      setInitial(false);
    } else {
      if (netInfo.isInternetReachable) {
        dispatch({
          type: "IS_CONNECTED",
          is_connected: true,
        });
      } else {
        dispatch({
          type: "IS_CONNECTED",
          is_connected: false,
        });
      }
    }
  }, [netInfo]);

  return (
    <SafeAreaView style={[styles.screen, style]}>
      {netInfo.isInternetReachable === false && netInfo.type !== "unknown" && (
        <View
          style={{
            backgroundColor: "red",
            position: "absolute",
            top: Constants.statusBarHeight,
            left: 0,
            elevation: 1,
            right: 0,
            alignItems: "center",
            justifyContent: "center",
            padding: 8,
            zIndex: 10,
          }}
        >
          <Text style={{ color: "white" }}>{noInternetText}</Text>
        </View>
      )}

      <View style={[styles.view, style]}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    paddingTop: Constants.statusBarHeight,
    flex: 1,
    display: "flex",
    backgroundColor: COLORS.primary,
  },
  view: {
    flex: 1,
    display: "flex",
  },
});

export default Screen;
