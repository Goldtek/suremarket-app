import React, { useEffect, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useStateValue } from "../StateProvider";
import { COLORS } from "../variables/color";
import { AppName } from "../app/services/appName";
import ListingDetailScreen from "../screens/ListingDetailScreen";
import ChatListScreen from "../screens/ChatListScreen";
import ChatScreen from "../screens/ChatScreen";
import LoginScreen from "../screens/LoginScreen";
import SignUpScreen from "../screens/SignUpScreen";
import SettingsScreen from "../screens/SettingsScreen";
import TabNavigator from "./TabNavigator";
import MyListingsScreen from "../screens/MyListingsScreen";
import FavouriteScreen from "../screens/FavoritesScreen";
import AllCategoryScreen from "../screens/AllCategoryScreen";
import ReportScreen from "../screens/ReportScreen";
import MyMembershipScreen from "../screens/MyMembershipScreen";
import ContactUsScreen from "../screens/ContactUsScreen";
import FAQScreen from "../screens/FAQScreen";
import HowToSellFastScreen from "../screens/HowToSellFastScreen";
import MoreScreen from "../screens/MoreScreen";
import MembershipScreen from "../screens/MembershipScreen";
import MyProfileScreen from "../screens/MyProfileScreen";
import EditPersonalDetailScreen from "../screens/EditPersonalDetailScreen";
import WhatIsAppComScreen from "../screens/WhatIsAppComScreen";
import TnCScreen from "../screens/TnCScreen";
import PrivacyPolicyScreen from "../screens/PrivacyPolicyScreen";
import ThirdPartyLicensesScreen from "../screens/ThirdPartyLicensesScreen";
import authStorage from "../app/auth/authStorage";
import EditListingScreen from "../screens/EditListingScreen";
import SelectLocationScreen from "../screens/SelectLocationScreen";
import SendEmailScreen from "../screens/SendEmailScreen";
import api, { removeAuthToken, setAuthToken } from "../api/client";
import SelectCategoryScreen from "../screens/SelectCategoryScreen";
import Pay from '../screens/payment';

const Stack = createStackNavigator();

const HomeNavigator = () => {
  const [{ user, auth_token }, dispatch] = useStateValue();
  const [userSet, setUserSet] = useState(false);
  const restoreUser = async () => {
    const storedUser = await authStorage.getUser();
    if (!storedUser) return;
    dispatch({
      type: "SET_AUTH_DATA",
      data: {
        user: JSON.parse(storedUser).user,
        auth_token: JSON.parse(storedUser).jwt_token,
      },
    });
    setUserSet(true);
  };
  const updateChatBadge = () => {
    setAuthToken(auth_token);
    api.get("my/chat").then((res) => {
      if (res.ok) {
        removeAuthToken();
        const badgeNumber = res.data.filter(
          (_chat) => _chat.is_read == 0 && user.id != _chat.source_id
        ).length;

        if (badgeNumber) {
          dispatch({
            type: "SET_CHAT_BADGE",
            chat_badge: badgeNumber,
          });
        }
      } else {
        removeAuthToken();
        // Error updating chat info
      }
    });
  };
  // chat badge update call
  useEffect(() => {
    if (!userSet) return;
    updateChatBadge();
  }, [userSet]);
  // restore user call
  useEffect(() => {
    restoreUser();
    updateConfigData();
  }, []);

  const updateConfigData = () => {
    api.get("config").then((res) => {
      if (res.ok) {
        dispatch({
          type: "SET_CONFIG",
          config: res.data,
        });
      } else {
        // TODO add error storing
      }
    });
  };
  return (
    <Stack.Navigator
      screenOptions={{
        headerBackTitle: "Back",
        headerTitleAlign: "center",
        headerStyle: {
          backgroundColor: COLORS.primary,
          height: 50,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 20,
        },
      }}
    >
      <Stack.Screen
        name="Listing"
        component={TabNavigator}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Listing Detail"
        component={ListingDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="All category" component={AllCategoryScreen} />
      <Stack.Screen name="Email Seller" component={SendEmailScreen} />
      <Stack.Screen name="Contact us" component={ContactUsScreen} />
      <Stack.Screen name="Report" component={ReportScreen} />
      <Stack.Screen name="Chat List" component={ChatListScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Location" component={SelectLocationScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Log In" component={LoginScreen} />
      <Stack.Screen name="Sign Up" component={SignUpScreen} />
      <Stack.Screen name="My Listings" component={MyListingsScreen} />
      <Stack.Screen name="My Membership" component={MyMembershipScreen} />
      <Stack.Screen name="Favourite" component={FavouriteScreen} />
      <Stack.Screen name="My Profile" component={MyProfileScreen} />
      <Stack.Screen name="FAQ" component={FAQScreen} />
      <Stack.Screen name="How To Sell Fast" component={HowToSellFastScreen} />
      <Stack.Screen name="More" component={MoreScreen} />
      <Stack.Screen name="Membership" component={MembershipScreen} />
      <Stack.Screen name={AppName} component={WhatIsAppComScreen} />
      <Stack.Screen name={"Select category"} component={SelectCategoryScreen} />
      <Stack.Screen name="Privacy Policy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="Pay" component={Pay}  options={{ title: "Subscription" }} />
      <Stack.Screen
        name="Licenses"
        component={ThirdPartyLicensesScreen}
        options={{ title: "Third Party Licenses" }}
      />
      <Stack.Screen
        name="TnC"
        component={TnCScreen}
        options={{ title: "Terms & Conditions" }}
      />
      <Stack.Screen
        name="Edit Personal Detail"
        component={EditPersonalDetailScreen}
      />
      <Stack.Screen name="Edit Listing" component={EditListingScreen} />
      <Stack.Screen name="MemberShipReport" component={EditListingScreen} />
    </Stack.Navigator>
);
};

export default HomeNavigator;
