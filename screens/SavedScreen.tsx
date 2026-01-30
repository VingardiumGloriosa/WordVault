import { useEffect, useState } from "react";
import { View, FlatList } from "react-native";
import { Text, Button } from "@rneui/themed";
import { useAuth } from "../auth/AuthProvider";
import { fetchSavedWords, deleteSavedWord } from "../lib/savedWords";

export default function SavedScreen() {
  const { session } = useAuth();
  const [words, setWords] = useState<any[]>([]);

  useEffect(() => {
    if (session) {
      fetchSavedWords(session.user.id).then(setWords);
    }
  }, [session]);

  return (
    <FlatList
      data={words}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={{ padding: 16 }}>
          <Text h4>{item.word}</Text>
          <Text>{item.part_of_speech}</Text>
          <Text>{item.definition}</Text>
          <Button
            type="clear"
            title="Remove"
            onPress={() => deleteSavedWord(item.id)}
          />
        </View>
      )}
    />
  );
}
