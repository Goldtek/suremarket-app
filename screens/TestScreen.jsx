import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";

const TestScreen = () => {
  const [imageUri, setImageUri] = useState();
  const requestGalleryParmission = async () => {
    if (Platform.OS !== "web") {
      const {
        status,
      } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("You need to enable permission to access image library ");
      } else handleSelectGalleryImage();
    }
  };
  const requestCameraParmission = async () => {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        alert("You need to enable permission to access your camera");
      } else handleSelectCameraImage();
    }
  };

  const handleSelectGalleryImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      // aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImageUri(result.uri);
      let localUri = result.uri;
      let filename = localUri.split("/").pop();
      let match = /\.(\w+)$/.exec(filename);
      let type = match ? `image/${match[1]}` : `image`;
      const image = {
        uri: localUri,
        name: filename,
        type,
      };
      console.log(image);
    }
  };

  const handleSelectCameraImage = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      // aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImageUri(result.uri);
      let localUri = result.uri;
      let filename = localUri.split("/").pop();
      let match = /\.(\w+)$/.exec(filename);
      let type = match ? `image/${match[1]}` : `image`;
      const image = {
        uri: localUri,
        name: filename,
        type,
      };
      console.log(image);
    }
  };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={styles.text}>test screen</Text>
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={{ height: 200, width: 200, resizeMode: "contain" }}
        />
      ) : (
        <View style={styles.view}>
          <Text style={styles.text}>no image</Text>
        </View>
      )}
      <TouchableOpacity
        style={{
          backgroundColor: "dodgerblue",
          padding: 20,
          borderRadius: 5,
          marginVertical: 10,
        }}
        onPress={requestCameraParmission}
      >
        <Text style={{ fontWeight: "bold", fontSize: 18, color: "#fff" }}>
          Open Camera
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          backgroundColor: "dodgerblue",
          padding: 20,
          borderRadius: 5,
          marginVertical: 10,
        }}
        onPress={requestGalleryParmission}
      >
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 18,
            color: "#fff",
          }}
        >
          Add Image
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
});

export default TestScreen;
