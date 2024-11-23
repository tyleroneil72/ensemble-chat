import { useState, useContext } from "react";
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
import { UserContext } from "../utils/UserContext";

export default function ChatScreen({ navigation }) {
  const { user } = useContext(UserContext);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const sendMessage = () => {
    if (!message.trim()) {
      Alert.alert("Error", "Message cannot be empty.");
      return;
    }

    // Add user message
    const newMessages = [
      ...messages,
      { id: Date.now().toString(), username: user.username, text: message },
    ];

    // Add mock bot response
    const botResponse = {
      id: (Date.now() + 1).toString(),
      username: "Ensemble Bot",
      text: "Hello World",
      profilePhoto: require("../../assets/placeholder.jpg"),
    };

    setMessages([...newMessages, botResponse]);
    setMessage("");
  };

  const renderMessage = ({ item }) => {
    const isUserMessage = item.username === user.username;

    return (
      <View
        style={[
          styles.messageContainer,
          isUserMessage
            ? styles.userMessageContainer
            : styles.botMessageContainer,
        ]}
      >
        <Image
          source={
            isUserMessage
              ? user.profilePhoto
                ? { uri: user.profilePhoto }
                : require("../../assets/placeholder.jpg")
              : item.profilePhoto
          }
          style={styles.profilePhoto}
        />
        <View
          style={[
            styles.messageBubble,
            isUserMessage ? styles.userMessageBubble : styles.botMessageBubble,
          ]}
        >
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.messageText}>{item.text}</Text>
        </View>
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
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContainer}
      />

      {/* Input Section */}
      <View style={styles.inputContainer}>
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
  botMessageContainer: {
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
  },
  botMessageBubble: {
    alignSelf: "flex-start",
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
});
