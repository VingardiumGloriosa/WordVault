import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SearchScreen from "../screens/SearchScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SavedScreen from "../screens/SavedScreen";
import LearnStack from "./LearnStack";
import { colors } from "../theme";

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.obsidian,
          borderTopColor: colors.charcoal,
          borderTopWidth: 1,
          height: 60 + (Platform.OS === "web" ? 20 : 0),
          paddingBottom: 8 + (Platform.OS === "web" ? 20 : 0),
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.ember,
        tabBarInactiveTintColor: colors.ghost,
        tabBarLabelStyle: {
          fontSize: 10,
          letterSpacing: 2,
          textTransform: "uppercase",
        },
      }}
    >
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "search" : "search-outline"} size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Saved"
        component={SavedScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "bookmark" : "bookmark-outline"} size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Learn"
        component={LearnStack}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "bulb" : "bulb-outline"} size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
