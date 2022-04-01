/* eslint-disable react/display-name */
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome5 } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { COLORS } from "../variables/color";
import NewListingButton from "./NewListingButton";
import AccountScreen from "../screens/AccountScreen";
import ChatListScreen from "../screens/ChatListScreen";
import FeaturedListingScreen from "../screens/FeaturedListingScreen";
import NewListingScreen from "../screens/NewListingScreen";
import { useStateValue } from "../StateProvider";
import AllCategoryScreen from "../screens/AllCategoryScreen";
import HomeNavigator from './HomeNavigator';


const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const [{ user, chat_badge }, dispatch] = useStateValue();
  return (
    <Tab.Navigator
      tabBarOptions={{
        showLabel: true,
        activeTintColor: COLORS.primary,
        keyboardHidesTabBar: true,
        // style: { position: "absolute" },
        labelStyle: {
          marginBottom: 5,
          fontSize: 12,
        },
        style: {
          height: 50,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={FeaturedListingScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="home" size={20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={AllCategoryScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="search" size={20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="New Listing"
        component={NewListingScreen}
        options={({ navigation }) => ({
          tabBarButton: () => (
            <NewListingButton
              onPress={() => {
                navigation.navigate("New Listing");
                dispatch({
                  type: "SET_NEW_LISTING_SCREEN",
                  newListingScreen: true,
                });
              }}
            />
          ),
          tabBarVisible: !user,
        })}
      />

      <Tab.Screen
        name="Chat List"
        component={ChatListScreen}
        options={{
          tabBarBadge: chat_badge,
          tabBarIcon: ({ color }) => (
            <FontAwesome name="comments" size={23} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="user-alt" size={20} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
