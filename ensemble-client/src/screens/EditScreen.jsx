import { useContext, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  Button,
  Image,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { UserContext } from "../utils/UserContext";
import * as ImagePicker from "expo-image-picker";

export default function EditScreen() {
  const { user, setUser } = useContext(UserContext);
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [profilePhoto, setProfilePhoto] = useState(user.profilePhoto);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "We need access to your photos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setProfilePhoto(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (!username || !email) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }
    setUser({ username, email, profilePhoto }); // Save changes to context
    Alert.alert("Success", "Profile updated successfully!");
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.screen}>
        <Text style={styles.title}>Edit Profile</Text>
        <View style={styles.photoContainer}>
          {profilePhoto ? (
            <Image source={{ uri: profilePhoto }} style={styles.profilePhoto} />
          ) : (
            <View style={styles.placeholderPhoto}>
              <Text style={styles.placeholderText}>No Photo</Text>
            </View>
          )}
          <Button title='Change Profile Photo' onPress={handlePickImage} />
        </View>
        <TextInput
          style={styles.input}
          placeholder='Username'
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder='Email'
          value={email}
          onChangeText={setEmail}
          keyboardType='email-address'
        />
        <Button title='Update' onPress={handleSave} />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eaf4fc",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  photoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#007bff",
  },
  placeholderPhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#999",
  },
  placeholderText: {
    color: "#666",
    fontSize: 16,
  },
  input: {
    width: "100%",
    height: 40,
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
