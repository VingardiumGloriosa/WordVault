import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { StyleSheet, View, Alert } from "react-native";
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
      if (!session?.user) throw new Error("You’re not logged in yet 💫");

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
      if (error instanceof Error) Alert.alert("Oops!", error.message);
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
      if (!session?.user) throw new Error("You’re not logged in yet 💫");

      const updates = {
        id: session.user.id,
        username,
        avatar_url,
        updated_at: new Date(),
      };

      const { error } = await supabase.from("profiles").upsert(updates);
      if (error) throw error;
    } catch (error) {
      if (error instanceof Error) Alert.alert("Uh-oh!", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text h4 style={styles.title}>
        Your Profile ✨
      </Text>

      <View style={styles.avatarWrap}>
        <Avatar
          size={150}
          url={avatarUrl}
          onUpload={(url: string) => {
            setAvatarUrl(url);
            updateProfile({ username, avatar_url: url });
          }}
        />
        <Text style={styles.helperText}>Tap to change your look 💅</Text>
      </View>

      <View style={styles.verticallySpaced}>
        <Input label="Email 💌" value={session?.user?.email} disabled />
      </View>

      <View style={styles.verticallySpaced}>
        <Input
          label="Username ✨"
          placeholder="Pick something cute"
          value={username || ""}
          onChangeText={setUsername}
        />
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          title={loading ? "Saving magic…" : "Save changes 💾"}
          onPress={() => updateProfile({ username, avatar_url: avatarUrl })}
          disabled={loading}
        />
      </View>

      <View style={styles.verticallySpaced}>
        <Button
          type="clear"
          title="Sign out 👋"
          onPress={() => signOut()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 16,
  },
  title: {
    textAlign: "center",
    marginBottom: 20,
  },
  avatarWrap: {
    alignItems: "center",
    marginBottom: 24,
  },
  helperText: {
    marginTop: 8,
    fontSize: 12,
    opacity: 0.6,
  },
  verticallySpaced: {
    paddingVertical: 6,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
});
