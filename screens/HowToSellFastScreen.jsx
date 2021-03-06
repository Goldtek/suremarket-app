import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { getSellFastTips } from "../app/services/sellFastTips";
import SellFaster from "../components/SellFaster";
import { COLORS } from "../variables/color";

const sellFastTipsData = getSellFastTips();

const HowToSellFastScreen = () => {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.mainWrap}>
          {sellFastTipsData.map((item, index) => (
            <SellFaster
              key={`${index}`}
              title={item.title}
              detail={item.detail}
              uri={item.uri}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    flex: 1,
  },
  mainWrap: {
    backgroundColor: COLORS.white,
    paddingHorizontal: "3%",
    alignItems: "center",
    marginTop: 15,
  },
  scrollContainer: {
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: 19,
    fontWeight: "bold",
    color: COLORS.text_dark,
  },
});

export default HowToSellFastScreen;
