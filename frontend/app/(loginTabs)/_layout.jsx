import { Stack } from "expo-router";
// import { Text, View } from "react-native";




export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        tabBarShowLabel: false,
        tabBarPressColor: "transparent", // 🔹 Removes Android ripple highlight
        tabBarPressOpacity: 1, // 🔹 Removes iOS opacity effect
        tabBarStyle: {
          backgroundColor: "#0c151c",
          borderTopWidth: 0,
          height: 120,
          paddingTop: 8,
          overflow: "hidden",
          borderColor: "white",
        },
      }}
    >   
       <Stack.Screen
        name="terms&Condtions"
        options={{
          title: "terms&Condtions",
          headerShown: false,

          headerStyle: {
            backgroundColor: "tomato", // only for this screen
          },
          headerTintColor: "#fff",
         
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          title: "Updates",
          headerShown: false,

          headerStyle: {
            backgroundColor: "tomato", // only for this screen
          },
          headerTintColor: "#fff",
         
        }}
      />
      <Stack.Screen
        name="otpChecker"
        options={{
          title: "",
           headerStyle: {
            backgroundColor: "#0c151c", // only for this screen
          },
          headerTintColor: "#fff",
        }}
        
      />

      
    </Stack>
  );
}
