import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { StyleSheet, View, Alert, Image } from "react-native";
import { Button, Text } from "@rneui/themed";
import * as ImagePicker from "expo-image-picker";
import { colors } from "../theme";

interface Props {
  size: number;
  url: string | null;
  onUpload: (filePath: string) => void;
}

export default function Avatar({ url, size = 150, onUpload }: Props) {
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const avatarSize = { height: size, width: size };

  useEffect(() => {
    if (url) downloadImage(url);
  }, [url]);

  async function downloadImage(path: string) {
    try {
      const { data, error } = await supabase.storage
        .from("avatars")
        .download(path);

      if (error) {
        throw error;
      }

      const fr = new FileReader();
      fr.readAsDataURL(data);
      fr.onload = () => {
        setAvatarUrl(fr.result as string);
      };
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Error", "Could not download avatar image.");
      }
    }
  }

  async function uploadAvatar() {
    try {
      setUploading(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        allowsEditing: true,
        quality: 1,
        exif: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const image = result.assets[0];

      if (!image.uri) {
        throw new Error("No image uri!");
      }

      const arraybuffer = await fetch(image.uri).then((res) =>
        res.arrayBuffer(),
      );

      const fileExt = image.uri?.split(".").pop()?.toLowerCase() ?? "jpeg";
      const path = `${Date.now()}.${fileExt}`;
      const { data, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, arraybuffer, {
          contentType: image.mimeType ?? "image/jpeg",
        });

      if (uploadError) {
        throw uploadError;
      }

      onUpload(data.path);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      } else {
        throw error;
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.ring}>
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            accessibilityLabel="Avatar"
            style={[avatarSize, styles.avatar, styles.image]}
          />
        ) : (
          <View style={[avatarSize, styles.avatar, styles.noImage]}>
            <Text style={styles.placeholder}>{"\u{1F5DD}"}</Text>
          </View>
        )}
      </View>
      <Button
        title={uploading ? "uploading..." : "change avatar"}
        onPress={uploadAvatar}
        disabled={uploading}
        type="outline"
        containerStyle={styles.uploadButton}
        buttonStyle={styles.uploadButtonInner}
        titleStyle={styles.uploadButtonText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
  },
  ring: {
    borderRadius: 80,
    borderWidth: 2,
    borderColor: colors.wine,
    padding: 3,
  },
  avatar: {
    borderRadius: 75,
    overflow: "hidden",
  },
  image: {
    objectFit: "cover",
  },
  noImage: {
    backgroundColor: colors.smoke,
    borderRadius: 75,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholder: {
    fontSize: 40,
    opacity: 0.3,
  },
  uploadButton: {
    marginTop: 14,
  },
  uploadButtonInner: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 10,
    borderColor: colors.charcoal,
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  uploadButtonText: {
    color: colors.ash,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
});
