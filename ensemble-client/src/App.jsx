import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { UserProvider } from "./utils/UserContext";

import ChatScreen from "./screens/ChatScreen";
import LoginScreen from "./screens/LoginScreen";
import EditScreen from "./screens/EditScreen";

const Nav = createStackNavigator();

export default function App() {
  return (
    <UserProvider>
      <NavigationContainer>
        <Nav.Navigator>
          <Nav.Screen
            name='Login'
            component={LoginScreen}
            options={{
              headerLeft: null,
              gestureEnabled: false, // Disables swipe-back gesture
            }}
          />
          <Nav.Screen
            name='Chat'
            component={ChatScreen}
            options={{
              headerLeft: null,
              gestureEnabled: false, // Disables swipe-back gesture
            }}
          />
          <Nav.Screen name='Edit' component={EditScreen} />
        </Nav.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}
