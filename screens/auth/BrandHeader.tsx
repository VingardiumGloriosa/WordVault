import { View } from "react-native";
import { Text } from "@rneui/themed";
import { ornament } from "../../theme";
import { authStyles as styles } from "./styles";

export default function BrandHeader({ tagline = "a compendium of language" }: { tagline?: string }) {
  return (
    <View style={styles.brandBlock}>
      <Text style={styles.ornament}>{ornament}</Text>
      <Text h1 h1Style={styles.brand}>WordVault</Text>
      <Text style={styles.tagline}>{tagline}</Text>
      <Text style={styles.ornament}>{ornament}</Text>
    </View>
  );
}
