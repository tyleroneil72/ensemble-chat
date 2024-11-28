import { useState, useContext, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
} from "react-native";
import { io } from "socket.io-client";
import { UserContext } from "../utils/UserContext";
import generateUUID from "../utils/generateUUID";
import * as Linking from "expo-linking";
import * as Location from "expo-location";

// Establish socket connection
const socket = io("http://10.16.49.26:3000");

export default function ChatScreen({ navigation }) {
  const { user } = useContext(UserContext);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMessageMenuOpen, setIsMessageMenuOpen] = useState(null);

  useEffect(() => {
    // Listen for incoming messages
    socket.on("receive_message", (data) => {
      // Ensure each received message has a unique ID
      const receivedMessage = {
        ...data,
        id: data.id || generateUUID(), // Use provided ID or generate one
      };
      setMessages((prevMessages) => [...prevMessages, receivedMessage]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  const sendMessage = () => {
    if (!message.trim()) {
      Alert.alert("Error", "Message cannot be empty.");
      return;
    }

    // Add the sender's message to the local state
    const newMessage = {
      id: generateUUID(),
      username: user.username,
      profilePhoto: user.profilePhoto,
      message,
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);

    // Send the message to the server
    socket.emit("send_message", newMessage);

    setMessage(""); // Clear the input field
  };

  const fetchLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Location access is required.");
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    // Add location message to chat
    const locationMessage = {
      id: generateUUID(),
      username: user.username,
      profilePhoto: user.profilePhoto,
      message: `📍 Location: https://www.google.com/maps?q=${latitude},${longitude}`,
    };

    setMessages((prevMessages) => [...prevMessages, locationMessage]);

    // Send the location message to the server
    socket.emit("send_message", locationMessage);
  };

  const handleShareToTwitter = (message, username) => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      `Ensemble App\n\n${username}: ${message}`
    )}`;
    Linking.openURL(twitterUrl); // Open the Twitter app or browser
    setIsMessageMenuOpen(null); // Close menu after sharing
  };

  const renderMessage = ({ item }) => {
    const isUserMessage = item.username === user.username;

    return (
      <View>
        <TouchableOpacity
          style={[
            styles.messageContainer,
            isUserMessage
              ? styles.userMessageContainer
              : styles.receivedMessageContainer,
          ]}
          onPress={() =>
            setIsMessageMenuOpen(isMessageMenuOpen === item.id ? null : item.id)
          }
        >
          <Image
            source={
              item.profilePhoto
                ? { uri: item.profilePhoto }
                : require("../../assets/placeholder.jpg")
            }
            style={styles.profilePhoto}
          />
          <View
            style={[
              styles.messageBubble,
              isUserMessage
                ? styles.userMessageBubble
                : styles.receivedMessageBubble,
            ]}
          >
            <Text style={styles.username}>{item.username}</Text>
            <Text style={styles.messageText}>{item.message}</Text>
          </View>
        </TouchableOpacity>

        {/* Dropdown Menu for "Share to Twitter" */}
        {isMessageMenuOpen === item.id && (
          <View style={styles.messageMenu}>
            <TouchableOpacity
              style={styles.messageMenuItem}
              onPress={() => handleShareToTwitter(item.message, item.username)}
            >
              <Text style={styles.messageMenuItemText}>Share to Twitter</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const handleEditProfile = () => {
    setIsMenuOpen(false); // Close menu
    navigation.navigate("Edit");
  };

  const handleLogout = () => {
    setIsMenuOpen(false); // Close menu
    navigation.navigate("Login");
  };

  return (
    <View style={styles.container}>
      {/* Menu Wrapper */}
      <View style={styles.menuWrapper}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setIsMenuOpen((prev) => !prev)}
        >
          <Text style={styles.menuButtonText}>⋮</Text>
        </TouchableOpacity>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <View style={styles.menu}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleEditProfile}
            >
              <Text style={styles.menuItemText}>Edit Profile</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Text style={styles.menuItemText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Chat Messages */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id} // Use unique ID
        contentContainerStyle={styles.messagesContainer}
      />

      {/* Input Section */}
      <View style={styles.inputContainer}>
        {/* Pin Icon */}
        <TouchableOpacity onPress={fetchLocation} style={styles.pinButton}>
          <Text style={styles.pinIcon}>📍</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          placeholder='Type your message...'
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eaf4fc",
    paddingTop: 50,
  },
  menuWrapper: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1000,
  },
  menuButton: {
    padding: 10,
  },
  menuButtonText: {
    fontSize: 24,
    color: "#007bff",
  },
  menu: {
    position: "absolute",
    top: 35,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    elevation: 3,
    zIndex: 1000,
    minWidth: 150,
  },
  menuItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  menuItemText: {
    fontSize: 16,
    color: "#333",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#ddd",
    marginHorizontal: 10,
  },
  messagesContainer: {
    padding: 10,
    paddingTop: 0,
    marginTop: 10,
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  userMessageContainer: {
    flexDirection: "row-reverse",
  },
  receivedMessageContainer: {
    flexDirection: "row",
  },
  profilePhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  messageBubble: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    maxWidth: "80%",
    borderColor: "#ccc",
    borderWidth: 1,
  },
  userMessageBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#e6f7ff",
  },
  receivedMessageBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#f0f0f0",
  },
  username: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  messageText: {
    fontSize: 16,
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    backgroundColor: "#fff",
  },
  pinButton: {
    marginRight: 10,
  },
  pinIcon: {
    fontSize: 24,
    color: "#007bff",
  },
  textInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  messageMenu: {
    position: "absolute",
    top: -10,
    right: 50,
    backgroundColor: "#fff",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    zIndex: 1000,
    elevation: 3,
    padding: 10,
  },
  messageMenuItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  messageMenuItemText: {
    fontSize: 16,
    color: "#007bff",
  },
});
