import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LearnHomeScreen from "../screens/learn/LearnHomeScreen";
import FlashcardsScreen from "../screens/learn/FlashcardsScreen";
import QuizScreen from "../screens/learn/QuizScreen";
import MatchGameScreen from "../screens/learn/MatchGameScreen";
import { colors } from "../theme";

export type LearnStackParamList = {
  LearnHome: undefined;
  Flashcards: { tag?: string } | undefined;
  Quiz: { tag?: string } | undefined;
  MatchGame: { tag?: string } | undefined;
};

const Stack = createNativeStackNavigator<LearnStackParamList>();

export default function LearnStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="LearnHome" component={LearnHomeScreen} />
      <Stack.Screen
        name="Flashcards"
        component={FlashcardsScreen}
        options={{ headerShown: true, title: "Flashcards", headerBackTitle: "Back", headerStyle: { backgroundColor: colors.void }, headerTintColor: colors.bone, headerTitleStyle: { color: colors.bone, fontSize: 14, } }}
      />
      <Stack.Screen
        name="Quiz"
        component={QuizScreen}
        options={{ headerShown: true, title: "Quiz", headerBackTitle: "Back", headerStyle: { backgroundColor: colors.void }, headerTintColor: colors.bone, headerTitleStyle: { color: colors.bone, fontSize: 14, } }}
      />
      <Stack.Screen
        name="MatchGame"
        component={MatchGameScreen}
        options={{ headerShown: true, title: "Match", headerBackTitle: "Back", headerStyle: { backgroundColor: colors.void }, headerTintColor: colors.bone, headerTitleStyle: { color: colors.bone, fontSize: 14, } }}
      />
    </Stack.Navigator>
  );
}
