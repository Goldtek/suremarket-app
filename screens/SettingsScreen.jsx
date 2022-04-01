import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Switch,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import AppSeparator from "../components/AppSeparator";
import { COLORS } from "../variables/color";
import authStorage from "../app/auth/authStorage";
import { FontAwesome5 } from "@expo/vector-icons";
import { useStateValue } from "../StateProvider";

const screenTitle = "Settings";
const notiTitle = "Notifications";
const myAdNotiTitle = "My Ads";
const chatNotiTitle = "Chat messages";
const highlightsNotiTitle = "Highlights";
const logoutbuttonTitle = "Log Out";

const SettingsScreen = () => {
  const [adEnabled, setAdEnabled] = useState(false);
  const [chatEnabled, setChatEnabled] = useState(false);
  const [highlightsEnabled, setHighlightsEnabled] = useState(false);
  const [{ user }, dispatch] = useStateValue();

  return (
    <ScrollView style={styles.container}>
      <View>
        <View style={styles.contentWrapper}>
          <Text style={styles.screenTitle}>{screenTitle}</Text>
          <AppSeparator style={styles.separator} />
          {/* <View style={styles.languageSupport}>
            <Text style={styles.languageTitle}>{languageTitle}</Text>
            <View style={styles.langButtons}>
              <AppButton
                title={languageData[1]}
                onPress={() => setCurrentLang(languageData[1])}
                style={
                  currentLang === languageData[0]
                    ? [styles.btnCommon, styles.btninActive]
                    : styles.btnCommon
                }
                textStyle={
                  currentLang === languageData[0]
                    ? styles.btnTextinActive
                    : styles.btnTextCommon
                }
              />
              <AppButton
                title={languageData[0]}
                onPress={() => setCurrentLang(languageData[0])}
                style={
                  currentLang !== languageData[0]
                    ? [styles.btnCommon, styles.btninActive]
                    : styles.btnCommon
                }
                textStyle={
                  currentLang !== languageData[0]
                    ? styles.btnTextinActive
                    : styles.btnTextCommon
                }
              />
            </View>
          </View>
           */}
          <AppSeparator style={styles.separator} />

          <View style={styles.notiWrapper}>
            <Text style={styles.notiTitle}>{notiTitle}</Text>
            <View style={styles.notiSwitchWrap}>
              <View style={styles.toggleSwitch}>
                <Text style={styles.toggleSwitchLabel}>{myAdNotiTitle}</Text>
                <Switch
                  trackColor={{ false: "#767577", true: "dodgerblue" }}
                  thumbColor={adEnabled ? COLORS.primary : "#f4f3f4"}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={() => setAdEnabled(!adEnabled)}
                  value={adEnabled}
                />
              </View>
              <View style={styles.toggleSwitch}>
                <Text style={styles.toggleSwitchLabel}>{chatNotiTitle}</Text>
                <Switch
                  trackColor={{ false: "#767577", true: "dodgerblue" }}
                  thumbColor={chatEnabled ? COLORS.primary : "#f4f3f4"}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={() => setChatEnabled(!chatEnabled)}
                  value={chatEnabled}
                />
              </View>
              <View style={styles.toggleSwitch}>
                <Text style={styles.toggleSwitchLabel}>
                  {highlightsNotiTitle}
                </Text>
                <Switch
                  trackColor={{ false: "#767577", true: "dodgerblue" }}
                  thumbColor={highlightsEnabled ? COLORS.primary : "#f4f3f4"}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={() => setHighlightsEnabled(!highlightsEnabled)}
                  value={highlightsEnabled}
                />
              </View>
            </View>
          </View>
        </View>
        <AppSeparator style={{ height: 15, backgroundColor: COLORS.bg_dark }} />

        {user && (
          <View style={styles.contentWrapper}>
            <TouchableOpacity
              style={styles.logOutWrap}
              onPress={() => {
                dispatch({
                  type: "SET_AUTH_DATA",
                  data: {
                    user: null,
                    auth_token: null,
                  },
                });
                authStorage.removeUser();
              }}
            >
              <FontAwesome5 name="power-off" size={16} color={COLORS.primary} />
              <Text style={styles.logOutTitle}>{logoutbuttonTitle}</Text>
            </TouchableOpacity>
          </View>
        )}
        <AppSeparator style={{ height: 15, backgroundColor: COLORS.bg_dark }} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  btnCommon: {
    width: "50%",
    paddingVertical: 9,
    borderRadius: 0,
  },
  btninActive: {
    backgroundColor: COLORS.white,
  },
  btnTextinActive: {
    color: COLORS.text_gray,
  },
  btnTextCommon: {
    color: COLORS.white,
  },
  changeDetailTitle: {
    padding: "3%",
    fontWeight: "bold",
  },
  changePassTitle: {
    padding: "3%",
    fontWeight: "bold",
  },

  container: {
    backgroundColor: COLORS.bg_dark,
  },
  contentWrapper: {
    backgroundColor: COLORS.white,
  },

  form: {
    paddingHorizontal: "3%",
    paddingTop: 10,
    paddingBottom: 20,
  },

  formSeparator: {
    backgroundColor: COLORS.gray,
    width: "100%",
    marginBottom: 10,
  },
  label: {
    color: COLORS.text_gray,
  },
  languageTitle: {
    fontSize: 20,
  },
  languageTitle2: {
    padding: "3%",
    fontWeight: "bold",
  },
  langButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  languageSupport: {
    padding: "3%",
  },
  languageSupport2: {
    paddingBottom: 10,
  },
  logOutWrap: {
    flexDirection: "row",
    paddingHorizontal: "5%",
    paddingVertical: 10,
    alignItems: "center",
  },
  logOutTitle: {
    fontWeight: "bold",
    paddingLeft: 10,
  },
  notiSwitchWrap: {},
  notiTitle: {
    fontSize: 20,
  },
  notiWrapper: {
    padding: "3%",
  },
  pickerWrap: {
    paddingHorizontal: "1%",
    paddingTop: 10,
  },
  screenTitle: {
    padding: "3%",
    fontWeight: "bold",
  },

  separator: {
    width: "100%",
  },
  toggleSwitch: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  updateButton: {
    width: "100%",
    borderRadius: 0,
    paddingVertical: 10,
  },
});

export default SettingsScreen;
