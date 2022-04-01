import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { getFAQ } from "../app/services/frequentlyAskedQuestions";
import FAQ from "../components/FAQ";
import { COLORS } from "../variables/color";

const faqData = getFAQ();
const pageTitle = "FAQ";
const FAQScreen = () => {
  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.mainWrap}>
          <View style={styles.contentWrap}>
            {faqData.map((item, index) => (
              <FAQ
                key={`${index}`}
                isLast={index < faqData.length - 1 ? false : true}
                item={item}
              />
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
  contentWrap: {
    borderWidth: 1,
    borderColor: COLORS.bg_dark,
    borderRadius: 5,
    backgroundColor: COLORS.bg_light,
    paddingVertical: 15,
  },
  mainWrap: {
    paddingHorizontal: "3%",
    paddingTop: 20,
    width: "100%",
  },
});

export default FAQScreen;
