import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { StyleSheet, View, Alert, ScrollView, SafeAreaView, Platform } from "react-native";
import { Button, Input, Text } from "@rneui/themed";
import { Session } from "@supabase/supabase-js";
import Avatar from "./Avatar";
import ScreenContainer from "./ScreenContainer";
import { useAuth } from "../auth/AuthProvider";
import { colors, fonts, ornament } from "../theme";
import { validateUsername } from "../lib/authErrors";
import { fetchSavedWords } from "../lib/savedWords";
import { fetchLearningStats } from "../lib/learningProgress";
import Skeleton from "./Skeleton";

export default function Account({ session }: { session: Session }) {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [dashStats, setDashStats] = useState<{ total: number; streak: number; mastered: number } | null>(null);

  useEffect(() => {
    if (session) {
      getProfile();
      Promise.all([
        fetchSavedWords(session.user.id),
        fetchLearningStats(session.user.id),
      ]).then(([saved, stats]) => {
        setDashStats({
          total: saved.length,
          streak: stats.streak,
          mastered: stats.mastered,
        });
      }).catch(() => {});
    }
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

      const usernameErr = validateUsername(username);
      if (usernameErr) {
        setUsernameError(usernameErr);
        return;
      }

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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
      <ScreenContainer>
        <Text style={styles.screenTitle}>Profile</Text>
        <Text style={styles.screenOrnament}>{ornament}</Text>

        <View style={styles.avatarWrap}>
          <Avatar
            size={140}
            url={avatarUrl}
            onUpload={(url: string) => {
              setAvatarUrl(url);
              updateProfile({ username, avatar_url: url });
            }}
          />
        </View>

        {dashStats ? (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{dashStats.total}</Text>
              <Text style={styles.statLabel}>Words</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{dashStats.mastered}</Text>
              <Text style={styles.statLabel}>Mastered</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{dashStats.streak}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
          </View>
        ) : (
          <View style={styles.statsRow}>
            <View style={styles.statCard}><Skeleton width={40} height={22} borderRadius={4} /><Skeleton width={50} height={10} borderRadius={4} style={{ marginTop: 6 }} /></View>
            <View style={styles.statCard}><Skeleton width={40} height={22} borderRadius={4} /><Skeleton width={50} height={10} borderRadius={4} style={{ marginTop: 6 }} /></View>
            <View style={styles.statCard}><Skeleton width={40} height={22} borderRadius={4} /><Skeleton width={50} height={10} borderRadius={4} style={{ marginTop: 6 }} /></View>
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>EMAIL</Text>
            <Input
              value={session?.user?.email}
              disabled
              inputStyle={styles.inputText}
              inputContainerStyle={styles.inputInner}
              disabledInputStyle={styles.disabledInput}
              containerStyle={styles.inputContainer}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>USERNAME</Text>
            <Input
              placeholder="choose a name"
              placeholderTextColor={colors.ghost}
              value={username || ""}
              onChangeText={(text) => {
                setUsername(text);
                setUsernameError(text.length > 0 ? validateUsername(text) : null);
              }}
              errorMessage={usernameError ?? undefined}
              inputStyle={styles.inputText}
              inputContainerStyle={styles.inputInner}
              containerStyle={styles.inputContainer}
              errorStyle={styles.errorText}
            />
          </View>

          <Button
            title={loading ? "saving..." : "Save Changes"}
            onPress={() => updateProfile({ username, avatar_url: avatarUrl })}
            disabled={loading}
            buttonStyle={styles.saveButton}
            disabledStyle={styles.disabledButton}
            titleStyle={styles.saveButtonText}
            disabledTitleStyle={styles.disabledButtonText}
            containerStyle={styles.saveContainer}
          />
        </View>

        <View style={styles.signOutWrap}>
          <Button
            type="clear"
            title="sign out"
            onPress={() => {
              if (Platform.OS === "web") {
                if (window.confirm("Are you sure you want to sign out?")) signOut();
              } else {
                Alert.alert(
                  "Sign Out",
                  "Are you sure you want to sign out?",
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Sign Out", style: "destructive", onPress: () => signOut() },
                  ],
                );
              }
            }}
            titleStyle={styles.signOutText}
          />
        </View>
      </ScreenContainer>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.void,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  screenTitle: {
    color: colors.bone,
    textAlign: "center",
    fontSize: 13,
    letterSpacing: 4,
    textTransform: "uppercase",
    marginTop: 12,
    fontFamily: fonts.body,
  },
  screenOrnament: {
    color: colors.faded,
    textAlign: "center",
    fontSize: 12,
    letterSpacing: 6,
    marginTop: 6,
    marginBottom: 24,
    fontFamily: fonts.body,
  },
  avatarWrap: {
    alignItems: "center",
    marginBottom: 28,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.obsidian,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.charcoal,
    paddingVertical: 14,
    alignItems: "center",
  },
  statValue: {
    color: colors.ember,
    fontSize: 22,
    fontWeight: "300",
    fontFamily: fonts.display,
  },
  statLabel: {
    color: colors.ash,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: 4,
    fontFamily: fonts.body,
  },
  card: {
    backgroundColor: colors.obsidian,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.charcoal,
    padding: 20,
    paddingTop: 24,
  },
  field: {
    marginBottom: 4,
  },
  fieldLabel: {
    color: colors.amberMuted,
    fontSize: 10,
    letterSpacing: 3,
    marginBottom: 0,
    marginLeft: 10,
    fontFamily: fonts.body,
  },
  inputContainer: {
    marginBottom: -4,
  },
  inputText: {
    color: colors.bone,
    fontSize: 15,
    fontFamily: fonts.body,
  },
  inputInner: {
    borderBottomColor: colors.charcoal,
    borderBottomWidth: 1,
  },
  disabledInput: {
    color: colors.ash,
    opacity: 1,
  },
  saveContainer: {
    marginTop: 16,
  },
  saveButton: {
    borderRadius: 12,
    paddingVertical: 14,
    backgroundColor: colors.wine,
  },
  saveButtonText: {
    color: colors.bone,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    fontSize: 12,
    fontFamily: fonts.body,
  },
  disabledButton: {
    backgroundColor: colors.charcoal,
  },
  disabledButtonText: {
    color: colors.ghost,
  },
  signOutWrap: {
    marginTop: 24,
    alignItems: "center",
  },
  signOutText: {
    color: colors.blood,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontFamily: fonts.body,
  },
  errorText: {
    color: colors.bloodBright,
    fontSize: 11,
    fontFamily: fonts.body,
  },
});
