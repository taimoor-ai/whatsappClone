import { Tabs } from "expo-router";
import { Text, View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
const GetTabBarIcon = ({ focused, icon, TabName }) => {
  return focused ? (
    <View className="min-h-32 min-w-28  w-full flex-1   mt-4 items-center justify-center">
      <View className="flex justify-center items-center h-10 w-20 rounded-full bg-[#103629]">
        <Icon name={icon} size={25} color="white" solid />
      </View>
      <Text className=" font-semibold ml-2 text-white">{TabName}</Text>
    </View>
  ) : (
    <View className="min-h-32 min-w-28  w-full flex-1   mt-4 items-center justify-center">
      <View className="flex justify-center items-center h-10 w-20 rounded-full bg-[#10362900]">
        <Icon name={icon} size={25} color="white" />
      </View>
      <Text className="text-white font-semibold ml-2">{TabName}</Text>
    </View>
  );
};

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarPressColor: "transparent", // 🔹 Removes Android ripple highlight
        tabBarPressOpacity: 1, // 🔹 Removes iOS opacity effect
        tabBarStyle: {
          backgroundColor: "#0c151c",
          borderTopWidth: 0,
          height: 100,
          paddingTop: 8,
          overflow: "hidden",
          borderColor: "white",
        },
      }}
    >
      <Tabs.Screen
        name="Chats"
        options={{
          title: "Chats",
          headerShown: false,

          headerStyle: {
            backgroundColor: "tomato", // only for this screen
          },
          headerTintColor: "#fff",
          tabBarIcon: ({ focused }) => (
            <GetTabBarIcon
              focused={focused}
              icon={"comment-dots"}
              TabName={"Chats"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Updates"
        options={{
          title: "Updates",
          headerShown: false,

          headerStyle: {
            backgroundColor: "tomato", // only for this screen
          },
          headerTintColor: "#fff",
          tabBarIcon: ({ focused }) => (
            <GetTabBarIcon focused={focused} icon={"pen"} TabName={"Updates"} />
          ),
        }}
      />
      <Tabs.Screen
        name="Communities"
        options={{
          title: "Communities",
          headerShown: false,

          headerStyle: {
            backgroundColor: "tomato", // only for this screen
          },
          headerTintColor: "#fff",
          tabBarIcon: ({ focused }) => (
            <GetTabBarIcon
              focused={focused}
              icon={"users"}
              TabName={"Communities"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Calls"
        options={{
          title: "Calls",
          headerShown: false,

          headerStyle: {
            backgroundColor: "tomato", // only for this screen
          },
          headerTintColor: "#fff",
          tabBarIcon: ({ focused }) => (
            <GetTabBarIcon focused={focused} icon={"phone"} TabName={"Calls"} />
          ),
        }}
      />
    </Tabs>
  );
}
