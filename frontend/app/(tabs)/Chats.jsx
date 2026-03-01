import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import ChatList from "../../components/ChatsList";
import { useSocket } from "../context/SocketContext";
import { getAllChats } from "../database/chatQueries";
import { debugDatabase } from "../database/debugDb";
import { clearDatabase } from "../database/logout"; // or wherever you created it
const MENU_ITEMS = [
  { label: "New group", icon: "users" },
  { label: "New broadcast", icon: "bullhorn" },
  { label: "Linked devices", icon: "laptop" },
  { label: "Starred messages", icon: "star" },
  { label: "Payments", icon: "money-bill-wave" },
  { label: "Starred", icon: "cog" },
  { label: "Settings", icon: "cog" },
  { label: "Logout", icon: "sign-out-alt" },
];

export default function Chats() {
  const { chats } = useSocket();
  const [isVisible, setVisible] = useState(true);
  const [chatsData, setChatsData] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const ellipsisRef = useRef(null);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // 1️⃣ Clear SQLite tables (recommended instead of deleting DB file)
      await clearDatabase();

      // 2️⃣ Remove auth token
      await AsyncStorage.removeItem("authToken");
      console.log("Token removed successfully");

      // 3️⃣ Navigate to login
      router.replace("/login"); // adjust path if needed

      console.log("Logged out successfully");
    } catch (error) {
      console.log("Logout error:", error);
    }
  };
  useEffect(() => {
    const setup = async () => {
      await getAllChats().then((chats) => {
        setChatsData(chats);
      });
    };
    setup();
  }, []);

  const openMenu = () => {
    ellipsisRef.current?.measure((fx, fy, width, height, px, py) => {
      setMenuPosition({ top: py + height - 20, right: 8 });
      setMenuVisible(true);
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => setMenuVisible(false));
  };

  const changeVisible = () => setVisible(!isVisible);
  const handleMenuPress = (label) => {
    closeMenu();

    if (label === "Logout") {
      handleLogout();
    } else if (label === "Settings") {
      debugDatabase();
    } else {
      console.log(`${label} pressed`);
    }
  };
  return (
    <View
      className={`flex-1 items-center bg-[#0c151c] ${isVisible ? "" : "pt-10"}`}
    >
      <StatusBar style="light" backgroundColor="#075E54" />

      {isVisible && (
        <View className="w-full flex flex-row h-28 justify-between items-center pt-12 px-4">
          <Text className="text-3xl font-bold text-white">WhatsApp</Text>
          <View className="flex flex-row w-24 items-center justify-between px-4 space-x-4">
            <TouchableOpacity onPress={() => console.log("camera pressed")}>
              <Icon name="camera" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity ref={ellipsisRef} onPress={openMenu}>
              <Icon name="ellipsis-v" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Dropdown Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="none"
        onRequestClose={closeMenu}
      >
        <TouchableWithoutFeedback onPress={closeMenu}>
          <View style={{ flex: 1 }}>
            <Animated.View
              style={{
                position: "absolute",
                top: menuPosition.top,
                right: menuPosition.right,
                backgroundColor: "#0c151c",
                borderRadius: 6,
                paddingVertical: 6,
                minWidth: 200,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
                elevation: 10,
                transformOrigin: "top right",
                transform: [
                  {
                    scaleX: scaleAnim,
                  },
                  {
                    scaleY: scaleAnim,
                  },
                ],
                opacity: opacityAnim,
              }}
            >
              {MENU_ITEMS.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleMenuPress(item.label)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 20,
                    paddingVertical: 13,
                  }}
                  activeOpacity={0.6}
                >
                  <Text
                    style={{
                      color: "#e9edef",
                      fontSize: 15.5,
                      fontWeight: "400",
                      letterSpacing: 0.2,
                    }}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <View>
        <ChatList
          Chats={chats}
          isVisible={isVisible}
          changeVisible={changeVisible}
        />
      </View>
    </View>
  );
}
