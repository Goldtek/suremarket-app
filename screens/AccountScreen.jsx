import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { COLORS } from "../variables/color";
import Option from "../components/Option";
import { useStateValue } from "../StateProvider";
import AppButton from "../components/AppButton";
import authStorage from "../app/auth/authStorage";
import FlashNotification from "../components/FlashNotification";
import AppSeparator from "../components/AppSeparator";

const options_user = [
  {
    screen: "My Listings",
    title: "My Listings",
    icon: "hdd-o",
    assetUri: require("../assets/my_listings.png"),
  },
  {
    screen: "Membership",
    title: "My Membership",
    icon: "diamond",
    assetUri: require("../assets/my_membership.png"),
  },
  {
    screen: "Favourite",
    title: "Favorites",
    icon: "star",
    assetUri: require("../assets/favorites.png"),
  },
  {
    screen: "My Profile",
    title: "My Profile",
    icon: "user",
    assetUri: require("../assets/my_profile.png"),
  },
  {
    screen: "FAQ",
    title: "FAQ",
    icon: "question-circle",
    assetUri: require("../assets/faq.png"),
  },
  {
    screen: "How To Sell Fast",
    title: "How to sell fast",
    icon: "key",
    assetUri: require("../assets/how_to_sell_fast.png"),
  },
  {
    screen: "More",
    title: "More",
    icon: "ellipsis-h",
    assetUri: require("../assets/more.png"),
  },
];
const options_null = [
  {
    screen: "FAQ",
    title: "FAQ",
    icon: "question-circle",
    assetUri: require("../assets/faq.png"),
  },
  {
    screen: "How To Sell Fast",
    title: "How to sell fast",
    icon: "key",
    assetUri: require("../assets/how_to_sell_fast.png"),
  },
  {
    screen: "More",
    title: "More",
    icon: "ellipsis-h",
    assetUri: require("../assets/more.png"),
  },
];

const headerText = "Account";
const loginButtonText = "Log in";
const logOutButtonText = "Log out";
const successMessage = "SuccessFully logged out";
const AccountScreen = ({ navigation }) => {
  const [{ user }, dispatch] = useStateValue();
  const [flashNotification, setFlashNotification] = useState(false);

  const handleLogout = () => {
    dispatch({
      type: "SET_AUTH_DATA",
      data: {
        user: null,
        auth_token: null,
      },
    });
    authStorage.removeUser();
    handleSuccess();
  };

  // external event on mount
  useEffect(() => {
    dispatch({
      type: "SET_NEW_LISTING_SCREEN",
      newListingScreen: false,
    });
  }, []);

  const handleSuccess = () => {
    setFlashNotification(true);

    setTimeout(() => {
      setFlashNotification(false);
    }, 1000);
  };

  const getUsername = () => {
    if (!!user.first_name || !!user.last_name) {
      return [user.first_name, user.last_name].join(" ");
    } else {
      return user.username;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerWrap}>
        <View style={styles.headerMain}>
          <Text style={styles.headerTitle}>{headerText}</Text>
        </View>
      </View>
      {user && (
        <>
          <View style={styles.userNameContainer}>
            <Text style={styles.userNameText}>{getUsername()}</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <AppSeparator style={{ width: "94%" }} />
          </View>
        </>
      )}
      {!user && (
        <View style={styles.loginWrap}>
          <AppButton
            title={loginButtonText}
            style={styles.loginButton}
            onPress={() => navigation.navigate("Log In")}
          />
        </View>
      )}
      <View Style={styles.optionsContainer}>
        <ScrollView style={{ paddingVertical: 10 }}>
          {(user ? options_user : options_null).map((item, index) => (
            <Option
              key={`${index}`}
              title={item.title}
              icon={item.icon}
              onPress={() => navigation.navigate(item.screen)}
              uri={item.assetUri}
            />
          ))}
          {user && (
            <View style={styles.logOutWrap}>
              <Option
                title={logOutButtonText}
                icon="power-off"
                onPress={() => handleLogout()}
                uri={require("../assets/log_out.png")}
              />
            </View>
          )}
        </ScrollView>
      </View>
      <FlashNotification
        falshShow={flashNotification}
        flashMessage={successMessage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    flex: 1,
  },
  headerMain: {
    alignItems: "center",
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.white,
  },
  headerWrap: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: "3%",
    flexDirection: "row",
    height: 50,
    alignItems: "center",
    justifyContent: "space-between",
  },
  loginButton: {
    paddingVertical: 10,
    borderRadius: 3,
  },
  loginWrap: {
    flexDirection: "row",
    paddingHorizontal: "3%",
    marginVertical: 40,
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  logOutWrap: {},
  optionsContainer: {
    flex: 1,
  },
  userNameContainer: {
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  userNameText: {
    fontSize: 20,
    color: "#444",
  },
});

export default AccountScreen;
