import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { decryptMessage } from "../utils/crypto";
import SearchBar from "./SearchBar";
export default function ChatList({ Chats = [], changeVisible, isVisible }) {
  const [searchValue, changeSearchValue] = useState("");
  const contacts = useSelector((state) => state.contacts.list); // might be undefined
  const router = useRouter();

  console.log("Contacts from Redux:", contacts);
  // const filteredData = [...Chats]; // default to Chats
  // ✅ UseMemo to recompute only when searchValue/contacts/Chats changes

  const filteredData = useMemo(() => {
    const safeContacts = contacts?.registeredUsers || [];
    console.log("safe Contacts: ", safeContacts);
    // 🔹 Normal mode → only chats
    if (isVisible) {
      return Chats.map((chat) => ({ ...chat, type: "chat" })).filter((item) =>
        item.name?.toLowerCase().includes(searchValue.toLowerCase()),
      );
    }

    // 🔹 Search mode → chats + contacts
    const chatItems = Chats.map((chat) => ({
      ...chat,
      type: "chat",
    }));

    const contactItems = safeContacts.map((contact) => ({
      id: contact.id || contact._id,
      name:
        contact.contactName ||
        `${contact.firstName || ""} ${contact.lastName || ""}`.trim() ||
        "Unknown Contact",
      avatar: contact.image || contact.profilePic || null,
      time: "",
      phoneNumber: contact.phoneNumber || "N/A",
      lastMessage: "",
      unreadCount: 0,
      type: "contact",
      about: contact.about || "No status",
    }));

    // Get all existing chat IDs
    const chatIds = new Set(chatItems.map((chat) => chat.id));

    // Remove contacts that already have chats
    const uniqueContacts = contactItems.filter(
      (contact) => !chatIds.has(contact.id),
    );

    const combinedData = [...chatItems, ...uniqueContacts];
    console.log("combinedData: ", combinedData);
    return combinedData.filter((item) =>
      item.name?.toLowerCase().includes(searchValue.toLowerCase()),
    );
  }, [searchValue, Chats, contacts, isVisible]);
  const changeVisible2 = () => {
    changeSearchValue("");
    changeVisible();
  };

  const searchBarComponent = (
    <SearchBar
      value={searchValue}
      onChangeText={changeSearchValue}
      placeholder="Search chats & contacts..."
      color={isVisible ? "#8696A0" : "white"}
      icon={!isVisible ? "arrow-left" : "search"}
      onFocus={isVisible ? changeVisible : () => {}}
      iconPress={changeVisible2}
    />
  );

  return (
    <View className={`flex-1 min-w-full px-4 ${isVisible ? "pb-32" : ""}`}>
      {!isVisible && searchBarComponent}

      <FlatList
        data={filteredData}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={isVisible ? searchBarComponent : null}
        // ✅ Empty state
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center py-10">
            <Text className="text-gray-400 text-base">
              {searchValue
                ? "No chats or contacts match your search."
                : "No chats or contacts available yet."}
            </Text>
          </View>
        )}
        ListFooterComponent={() =>
          filteredData.length > 0 ? (
            <View className="flex-1 justify-center items-center h-16">
              <Text className="text-gray-500 text-sm font-bold">
                Tap and hold the Chat for More Options
              </Text>
            </View>
          ) : null
        }
        keyExtractor={(item) => item.id?.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="flex-row items-center w-full h-20 py-3"
            onPress={() => {
              if (item.type === "chat") {
                router.push({
                  pathname: `/chats/${item.id}`,
                  params: {
                    user: JSON.stringify(item),
                  },
                });
              } else {
                router.push({
                  pathname: `/chats/${item.id}`,
                  params: {
                    user: JSON.stringify(item),
                  },
                });
              }
            }}
          >
            {/* Avatar */}
            <Image
              source={
                item.avatar
                  ? { uri: item.avatar } // if user has image
                  : require("../assets/images/default_profile.png") // fallback to local default
              }
              className="w-12 h-12 rounded-full"
            />

            {/* Info */}
            <View className="flex-1 ml-3">
              <View className="flex-row justify-between">
                <Text className="font-bold text-white text-base">
                  {item.name}
                </Text>
                {item.lastMessageTime ? (
                  <Text className="text-xs text-gray-500">
                    {new Date(item.lastMessageTime).toLocaleString()}
                  </Text>
                ) : null}
              </View>
              <View className="flex-row justify-between items-center mt-1">
                <Text
                  className={`text-sm ${
                    item.unReadCount > 0
                      ? "font-bold text-gray-500"
                      : "text-gray-500"
                  }`}
                  numberOfLines={1}
                >
                  {
                    decryptMessage(item.lastMessageText) || item.about
                    // (item.type === "contact" ? "Contact" : "")}
                  }
                </Text>

                {item.unReadCount > 0 && (
                  <View className="bg-green-500 rounded-full px-2 py-0.5">
                    <Text className="text-white text-xs font-bold">
                      {item.unReadCount}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
