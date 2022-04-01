import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import MoreOptions from "../components/MoreOptions";
import { COLORS } from "../variables/color";
import { AppName } from "../app/services/appName";

const data = [
  {
      uri: "",
      title: AppName + " Subscription",
      detail:
        "Subscription allows you to have unlimited access to the Suremarket platform, and enables you connect to over 50 million ready to buy customers on" +
        AppName +
        ", so that you can sell more of your items to real people.",
      pageName: "Subscription",
    },
    {
      uri: "",
      title: "Contact us",
      detail:
        "If you face any problem or need answers to specific questions about Suremarket, please feel free to contact us.",
      pageName: "Contact us",
    },
    {
      uri: "",
      title: "What is " + AppName + "?",
      detail:
        AppName +
        " is an online platform where you can buy and sell almost everything. The best deals are often done with people who lives nearby.",
    pageName: AppName,
    },
    {
      uri: "",
      title: "Terms and Conditions",
      detail:
        "Please be sure to read these Terms & Conditions before using this app.",
      pageName: "TnC",
    },
  {
    uri: "",
    title: "Privacy Policy",
    detail: "BY USING THE SERVICE, YOU PROMISE US THAT (I) YOU HAVE READ, UNDERSTAND, AND AGREE TO THIS PRIVACY POLICY, AND (II) YOU ARE OVER 18 YEARS OF AGE.",
    pageName: null,
  },
];

const MoreScreen = () => {
  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.mainWrap}>
          {data.map((item, index) => (
            <MoreOptions
              key={`${index}`}
              uri={item.uri}
              title={item.title}
              detail={item.detail}
              pageName={item.pageName}
              isLast={index != data.length - 1 ? false : true}
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
    paddingTop: 10,
  },
});

export default MoreScreen;
