
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker"; // for country select
import axios from "axios";
import { useRouter } from "expo-router";
// import { parsePhoneNumberFromString } from "libphonenumber-js";
import PhoneNumber from 'awesome-phonenumber';
import Constants from "expo-constants";
import { useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
// import { ActivityIndicator } from "react-native-web";
const dialCodeToRegion = {
  '+92': "PK",
  '+91': "IN",
  '+1': "US",
  '+44': "GB",
};
const {       API_URL_IP } = Constants.expoConfig.extra;
export default function PhoneNumberScreen() {
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [param, setParam] = useState(null);
  const router = useRouter();

  // const handleNext = () => {
  //   if (!phone) return;
  //   // 👉 Send phone to backend to generate OTP
  //   console.log("Phone submitted:", countryCode + phone);
  //   router.push("/otp"); // go to OTP screen
  // };
  const handleNext = async () => {
    console.log("Phone number entered:", phone.length);
    if (!phone.trim()) {
      alert("Please enter your phone number");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `http://${API_URL_IP}:3000/api/auth/send-otp`,
        { phone}
      );

      if (response.status === 200) {
        // ✅ Navigate to otpcheck route and pass phone as param
        router.push({  
          pathname: "/otpChecker",
          params: { phone:param,simplePhone:phone },
        });
      } else {
        alert(response.data?.message || "Something went wrong");
      }
    } catch (error) {
      console.error("❌ Login failed:", error);
      alert(error.response?.data?.message || "Login failed, try again");
    } finally {
      setLoading(false);
    }
  };
  const handleChange = (value) => {
    // console.log("i am entered");
    setPhone(value);
    const region = dialCodeToRegion[countryCode]; // "PK"
    const pn = new PhoneNumber(value, { regionCode: region});
    
    // console.log(pn.valid)
    if(pn.valid){
      // console.log(pn.getNumber('e164')) // +923001234567
      // setPhone(pn.number.e164) // +923001234567
      setParam(pn.number.e164)
    }
    setIsValid(pn.valid);

  };
  
  return (
    <View className="flex-1 bg-[#0c151c] px-6 pt-16 mt-10 flex-col  justify-start">
      {/* Title */}
      <Text className="text-lg font-semibold text-center text-[#60d7c1] mb-2">
        Enter your phone number
      </Text>
      <Text className="text-gray-500 text-center mb-6">
        WhatsApp will need to verify your phone number.
      </Text>

      {/* Country Picker */}
      <View className="border-b border-[#60d7c1]  mb-4">
        <Picker
          selectedValue={countryCode}
          onValueChange={(itemValue) => setCountryCode(itemValue)}
          style={{ color: "#fff", backgroundColor: "transparent" }}
        >
          <Picker.Item label="India" value="+91" />
          <Picker.Item label="Pakistan" value="+92" />
          <Picker.Item label="United States" value="+1" />
          <Picker.Item label="United Kingdom" value="+44" />
          {/* Add more countries */}
        </Picker>
        <Ionicons
          name="chevron-down"
          size={20}
          color="#60d7c1" // change triangle color here
          style={{
            position: "absolute",
            right: 14,
            top: 15,
            pointerEvents: "none",
          }}
        />
      </View>

      {/* Phone input with country code */}
      <View className="flex-row items-center   rounded-md px-3 py-2 mb-4">
        <Text className="text-lg h-full pt-3 border-b border-[#60d7c1] text-gray-500 mr-2">
          {countryCode}
        </Text>
        <TextInput
          value={phone}
          onChangeText={handleChange}
          keyboardType="phone-pad"
          placeholder="phone number"
          placeholderTextColor="#555"
          className="flex-1 text-lg border-b  border-[#60d7c1] text-white outline-none"
        />
      </View>

      <Text className="text-gray-400 text-sm text-center mb-6">
        Carrier charges may apply
      </Text>

      {/* Next button */}
       <View className="items-center mt-16">
     

      <TouchableOpacity
        onPress={handleNext}
        disabled={!isValid || loading}
        className={`py-3 h-15 w-24 rounded-lg mt-6 ${
          isValid ? "bg-[#008068]" : "bg-[#6cbbae]"
        }`}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-center text-lg font-semibold">
            NEXT
          </Text>
        )}
      </TouchableOpacity>
    </View>
      
    </View>
  );
}
