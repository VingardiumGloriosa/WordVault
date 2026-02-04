import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { StyleSheet, View, Alert, ScrollView } from "react-native";
import { Button, Input, Text } from "@rneui/themed";
import { Session } from "@supabase/supabase-js";
import Avatar from "./Avatar";
import { useAuth } from "../auth/AuthProvider";

export default function Account({ session }: { session: Session }) {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (session) getProfile();
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No active session");

      const { data, error, status } = await supabase
        .from("profiles")
        .select(`username, avatar_url`)
        .eq("id", session.user.id)
        .single();

      if (error && status !== 406) throw error;

      if (data) {
        setUsername(data.username);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      if (error instanceof Error) Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile({
    username,
    avatar_url,
  }: {
    username: string;
    avatar_url: string;
  }) {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No active session");

      const updates = {
        id: session.user.id,
        username,
        avatar_url,
        updated_at: new Date(),
      };

      const { error } = await supabase.from("profiles").upsert(updates);
      if (error) throw error;
    } catch (error) {
      if (error instanceof Error) Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text h4 style={styles.title}>Your Profile</Text>

      <View style={styles.avatarWrap}>
        <Avatar
          size={150}
          url={avatarUrl}
          onUpload={(url: string) => {
            setAvatarUrl(url);
            updateProfile({ username, avatar_url: url });
          }}
        />
      </View>

      <View style={styles.verticallySpaced}>
        <Input
          label="Email"
          value={session?.user?.email}
          disabled
          labelStyle={styles.label}
          inputStyle={styles.inputText}
          inputContainerStyle={styles.inputInner}
          disabledInputStyle={styles.disabledInput}
        />
      </View>

      <View style={styles.verticallySpaced}>
        <Input
          label="Username"
          placeholder="Enter a username"
          placeholderTextColor="#555"
          value={username || ""}
          onChangeText={setUsername}
          labelStyle={styles.label}
          inputStyle={styles.inputText}
          inputContainerStyle={styles.inputInner}
        />
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          title={loading ? "Saving..." : "Save Changes"}
          onPress={() => updateProfile({ username, avatar_url: avatarUrl })}
          disabled={loading}
          buttonStyle={styles.saveButton}
          disabledStyle={styles.disabledButton}
          titleStyle={styles.saveButtonText}
        />
      </View>

      <View style={styles.verticallySpaced}>
        <Button
          type="clear"
          title="Sign Out"
          onPress={() => signOut()}
          titleStyle={styles.signOutText}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#0a0a0a",
  },
  container: {
    marginTop: 40,
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    textAlign: "center",
    marginBottom: 20,
    color: "#d4d4d4",
  },
  avatarWrap: {
    alignItems: "center",
    marginBottom: 24,
  },
  verticallySpaced: {
    paddingVertical: 6,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
  label: {
    color: "#a855f7",
    fontWeight: "normal",
    letterSpacing: 0.5,
  },
  inputText: {
    color: "#d4d4d4",
  },
  inputInner: {
    borderBottomColor: "#2a1545",
    borderBottomWidth: 1.5,
  },
  disabledInput: {
    color: "#666",
    opacity: 1,
  },
  saveButton: {
    borderRadius: 10,
    paddingVertical: 14,
    backgroundColor: "#7c3aed",
  },
  saveButtonText: {
    color: "#e8e0f0",
    fontWeight: "bold",
    letterSpacing: 1,
  },
  disabledButton: {
    backgroundColor: "#1e1035",
  },
  signOutText: {
    color: "#dc2626",
    letterSpacing: 0.5,
  },
});
