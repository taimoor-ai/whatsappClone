import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";

SplashScreen.preventAutoHideAsync();

export default function Splashscreen({ onFinish }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(async () => {
        await SplashScreen.hideAsync();
        onFinish();
      }, 2000);
    });
  }, []);

  return (
    <View style={styles.container}>
      {/* middle icon */}

      <Animated.View
        style={{
          opacity,
          alignSelf: "center",
          height: "50%",
          justifyContent: "flex-end",
        }}
      >
        <Icon name="whatsapp" size={90} color="#fff" />
      </Animated.View>

      {/* bottom text */}
      <View className="flex-1 h-20 justify-end mb-10">
        <View className="flex-row items-center justify-center">
          <Text style={styles.metaText}>from</Text>
        </View>
        <View className="flex-row items-center">
          <Icon
            name="whatsapp"
            size={20}
            color="#fff"
            style={{ marginRight: 5 }}
          />
          <Text style={styles.metaText2}>meta</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0c151c",
    justifyContent: "center", // ✅ pushes icon to center & text to bottom
    alignItems: "center",
    paddingVertical: 50, // ✅ adds spacing at top & bottom
  },

  metaText: {
    color: "#fff", // ensures text is at the bottom
    fontSize: 18,
    opacity: 0.5,
  },
  metaText2: {
    color: "#fff", // ensures text is at the bottom
    fontSize: 22,
    fontWeight: "bold",
    opacity: 0.7,
  },
});
