import { View, ViewStyle, StyleSheet } from "react-native";
import { colors } from "../theme";

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export default function ScreenContainer({ children, style }: Props) {
  return (
    <View style={[styles.container, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
    backgroundColor: colors.void,
  },
});
