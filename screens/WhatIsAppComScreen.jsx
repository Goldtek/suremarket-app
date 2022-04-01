import React from "react";
import { View, Text, StyleSheet, ScrollView, Linking } from "react-native";
import { getAppDescription } from "../app/services/appDescription";
import { COLORS } from "../variables/color";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AppName } from "../app/services/appName";

const title = "What is " + AppName + "?";

const appDescriptionData = getAppDescription();

const WhatIsAppComScreen = () => {
  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.mainWrap}>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>{title}</Text>
          </View>
          <View style={styles.detailWrap}>
            {appDescriptionData.paras.map((_para, index) => (
              <View key={index} style={styles.descriptionParaWrap}>
                {!!_para.paraTitle && (
                  <Text style={styles.paraTitle}>{_para.paraTitle}</Text>
                )}
                {_para.paraType === "para" ? (
                  <Text style={styles.paraDetail}>{_para.paraDetail}</Text>
                ) : (
                  <View style={styles.bulletParaWrap}>
                    {_para.paraDetail.map((_bullet, index) => (
                      <View key={index} style={styles.bulletWrap}>
                        <View
                          style={{
                            alignItems: "center",
                            justifyContent: "center",
                            marginTop: 3,
                          }}
                        >
                          <MaterialCommunityIcons
                            name="circle-medium"
                            size={15}
                            color="black"
                          />
                        </View>
                        <Text style={styles.bulletDetail}>{_bullet}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
            {!!appDescriptionData.link &&
              !!appDescriptionData.linkedPara.length && (
                <View style={styles.linkedParaWrap}>
                  <Text
                    style={{
                      fontSize: 14,
                      lineHeight: 22,
                    }}
                  >
                    {appDescriptionData.linkedPara[0]}
                    <Text
                      style={styles.linkedText}
                      onPress={() => {
                        Linking.openURL(appDescriptionData.link);
                      }}
                    >
                      {appDescriptionData.linkedPara[1]}
                    </Text>
                    {appDescriptionData.linkedPara[2]}
                  </Text>
                </View>
              )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  bulletDetail: {
    paddingHorizontal: 5,
    textAlign: "justify",
    fontSize: 14,
    lineHeight: 22,
  },
  bulletParaWrap: {
    width: "100%",
  },
  bulletWrap: {
    flexDirection: "row",
    marginRight: 5,
    alignItems: "flex-start",
  },
  container: {
    backgroundColor: COLORS.white,
    flex: 1,
  },
  descriptionParaWrap: {
    marginBottom: 15,
    paddingRight: 5,
  },
  detailWrap: {
    width: "100%",
  },
  linkedParaWrap: {
    marginBottom: 10,
  },
  linkedText: {
    color: COLORS.blue,
    fontSize: 14,
    lineHeight: 22,
  },
  paraTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 5,
  },
  paraDetail: {
    textAlign: "justify",
    fontSize: 14,
    lineHeight: 22,
  },
  mainWrap: {
    paddingHorizontal: "3%",
    paddingVertical: 15,
    width: "100%",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text_dark,
    marginBottom: 10,
  },
  titleWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default WhatIsAppComScreen;
