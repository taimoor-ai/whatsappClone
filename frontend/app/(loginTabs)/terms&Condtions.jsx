import { useRouter } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function TermsScreen() {
  const router = useRouter();

  const handleAgree = () => {
    // 👉 Go to login or next screen
    router.replace("/login");
  };

  return (
    <View className="flex-1 bg-[#0c151c] px-6 pt-24">
      {/* Header */}
      <Text className="text-green-600 text-3xl font-bold text-center">
        WhatsApp Clone
      </Text>
      <Text className="text-gray-600 text-sm text-center mt-1">
        An easy tool to communicate with your contacts
      </Text>

      {/* Illustration Placeholder (you can add an Image here) */}
      <Image
        source={require("../../assets/images/whatsappDoodle.webp")} // replace with your own image
        className="w-72 h-72 mt-9 rounded-full self-center"
        resizeMode=""
      />
      {/* Terms text */}
      <ScrollView className="mt-8 mb-4" style={{ maxHeight: 150 }}>
        <Text className="text-gray-500 text-center">
          {/* Tap "Agree and continue" to accept the{" "} */}
          <Text className="text-blue-600 underline">Terms of Service</Text>.
        </Text>
      </ScrollView>

      {/* Buttons */}
      <TouchableOpacity
        onPress={handleAgree}
        className="bg-green-600 py-3 rounded-lg mb-4"
      >
        <Text className="text-white text-lg font-semibold text-center">
          AGREE AND CONTINUE
        </Text>
      </TouchableOpacity>

      <TouchableOpacity className=" mb-20">
        <Text className="text-center text-gray-600 font-medium">
          NOT A BUSINESS
        </Text>
      </TouchableOpacity>
    </View>
  );
}
