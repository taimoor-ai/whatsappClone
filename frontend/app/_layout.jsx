// app/_layout.jsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Constants from "expo-constants";
import * as Contacts from "expo-contacts";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import "react-native-get-random-values";
import { Provider, useDispatch } from "react-redux";
import { SocketProvider } from "../app/context/SocketContext";
import Splash from "../components/Splashscreen";
import { setContacts } from "../components/store/slices/contactsSlice";
import store from "../components/store/store";
import { AuthContext } from "./context/authContext";
import { insertChats } from "./database/chatQueries";
import { createTables } from "./database/tables";
import "./global.css";
const { API_URL_IP } = Constants.expoConfig.extra;
function RootContent() {
  const [hasPermission, setHasPermission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null); // 🔑 token state
  const [isReady, setIsReady] = useState(false);

  // console.log("api url= ",API_URL_IP);
  const dispatch = useDispatch();

  // console.log("i am called useeffect");
  // console.log(token);
  useEffect(() => {
    const setup = async () => {
      await createTables(); // ensures table exists
      await insertChats(); // inserts sample chats
    };

    setup();
  }, []);
  useEffect(() => {
    (async () => {
      // await AsyncStorage.removeItem("authToken");
      // console.log("Token removed successfully");
      // await clearDatabase();
      // await deleteDatabase();
      // // ✅ 1. Get token from storage
      const storedToken = await AsyncStorage.getItem("authToken");
      if (!storedToken) {
        setToken(null);
        setLoading(false);
        console.log("i am called ");
        return;
      }
      setToken(storedToken);
      createTables();
      // console.log("Stored token found:", storedToken);
      // ✅ 2. Permissions for contacts
      const { status } = await Contacts.getPermissionsAsync();
      if (status !== "granted") {
        const { status: newStatus } = await Contacts.requestPermissionsAsync();
        if (newStatus !== "granted") {
          setHasPermission(false);
          setLoading(false);
          return;
        }
      }
      setHasPermission(true);
      // console.log("Permission to access contacts granted");
      // ✅ 3. Sync contacts
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
      });

      if (data.length > 0) {
        const formattedContacts = data
          .filter((c) => c.phoneNumbers && c.phoneNumbers.length > 0)
          .map((c) => ({
            name: c.name,
            phoneNumber: c.phoneNumbers[0].number,
          }));
        // console.log("Contacts fetched:", formattedContacts.length);
        try {
          // console.log(`http://${API_URL_IP}:3000/api/contacts/sync`);
          const response = await axios.post(
            `http://${API_URL_IP}:3000/api/contacts/sync`,
            { contacts: formattedContacts },
            {
              headers: {
                Authorization: `Bearer ${storedToken}`,
                "Content-Type": "application/json",
              },
            },
          );
          // console.log("Contacts synced with backend:", response.data);
          dispatch(setContacts(response.data));
        } catch (error) {
          // console.error("❌ Error syncing contacts:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    })();
  }, [token]);
  if (!isReady) {
    return <Splash onFinish={() => setIsReady(true)} />;
  }
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Text className="text-white">Loading...</Text>
      </View>
    );
  }

  return (
    <SocketProvider token={token}>
      <AuthContext.Provider value={{ token, setToken }}>
        <Stack screenOptions={{ headerShown: false }}>
          {!token ? (
            <Stack.Screen name="(loginTabs)" />
          ) : (
            <>
              {/* {console.log("i am called else part")}sssssssss */}
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="chats/[id]" />
            </>
          )}
        </Stack>
      </AuthContext.Provider>
    </SocketProvider>
  );
}

export default function RootLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <Provider store={store}>
        <RootContent />
      </Provider>
    </View>
  );
}
