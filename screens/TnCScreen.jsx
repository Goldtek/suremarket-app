import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { getTnC } from "../app/services/termsAndConditions";
import { COLORS } from "../variables/color";

const tncTitleText = "Terms and Conditions";
const tnCData = getTnC();
const TnCScreen = () => {
  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.mainWrap}>
          <Text
            style={{
              textAlign: "center",
              fontWeight: "bold",
              marginTop: 10,
              fontSize: 17,
            }}
          >
            {tncTitleText}
          </Text>
          <View
            style={{
              alignItems: "center",
              paddingVertical: 10,
              paddingHorizontal: "3%",
            }}
          >
            {tnCData.map((_tnc, index) => (
              <View style={styles.tncParaWrap} key={index}>
                {!!_tnc.paraTitle && (
                  <Text style={styles.paraTitle}>{_tnc.paraTitle}</Text>
                )}
                {!!_tnc.paraData && (
                  <Text style={styles.paraData}>{_tnc.paraData}</Text>
                )}
              </View>
            ))}
          </View>
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
    paddingVertical: 15,
  },
  paraTitle: {
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 5,
  },
  paraData: {
    textAlign: "justify",
    fontSize: 14,
    lineHeight: 22,
  },
  tncParaWrap: {
    marginBottom: 20,
    width: "100%",
  },
});

export default TnCScreen;
