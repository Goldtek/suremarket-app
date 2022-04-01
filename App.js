import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import Screen from "./components/Screen";
import HomeNavigator from "./navigation/HomeNavigator";
import { StateProvider } from "./StateProvider";
import reducer, { initialState } from "./reducer";

const App = () => {
  return (
    <StateProvider initialState={initialState} reducer={reducer}>
      <Screen>
        <NavigationContainer>
          <HomeNavigator />
        </NavigationContainer>
      </Screen>
    </StateProvider>
  );
};

export default App;
