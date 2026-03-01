import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Constants from "expo-constants";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useContext, useRef, useState } from "react";

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AuthContext } from "../context/authContext";
// import { router } from "expo-router";
const {       API_URL_IP } = Constants.expoConfig.extra;
const OtpForm = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputs = useRef([]);
  const router = useRouter();
   const { setToken } = useContext(AuthContext);
  // console.log(setToken)
  const handleChange = (text, index) => {
    let newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto focus next input
    if (text && index < otp.length - 1) {
      inputs.current[index + 1].focus();
    }
  };
  const [loading, setLoading] = useState(false);
  const { phone, simplePhone } = useLocalSearchParams();
  // Handle auto focus next input

  const verifyOtp = async () => {
    setLoading(true);

    try {
      const response = await axios.post(
        `http://${API_URL_IP}:3000/api/auth/verify-otp`,
        { phone: simplePhone, otp: otp.join("") }
      );

      if (response.status === 200) {
        // ✅ Navigate to otpcheck route and pass phone as param
        alert(response.data?.message || "login successful");
       
          try {
            console.log("Saving token:", response.data?.jwtToken);
            setToken(response.data?.jwtToken); // Update context state
            await AsyncStorage.setItem("authToken", response.data?.jwtToken);
            router.replace("/(tabs)/Chats");
            console.log("Token saved successfully!");
          } catch (error) {
            console.error("Error saving token", error);
        };
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
  return (
    <View style={styles.otpForm}>
      <Text style={styles.mainHeading}>Enter OTP</Text>
      <Text style={styles.otpSubheading}>
        We have sent a verification code to your mobile number{" "}
        <Text style={{ color: "#008068", fontWeight: "bold", fontSize: 15 }}>
          {phone}
        </Text>
      </Text>

      <View style={styles.inputContainer}>
        {[0, 1, 2, 3, 4, 5].map((_, index) => (
          <TextInput
            key={index}
            style={styles.otpInput}
            maxLength={1}
            keyboardType="numeric"
            ref={(el) => (inputs.current[index] = el)}
            onChangeText={(text) => handleChange(text, index)}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.verifyButton} onPress={verifyOtp}>
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.verifyText}>Verify</Text>
        )}
      </TouchableOpacity>

      <View style={styles.resendNote}>
        <Text style={styles.resendText}>Didn't receive the code?</Text>
        <TouchableOpacity>
          <Text style={styles.resendBtn}>Resend Code</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  otpForm: {
    width: "100%",
    height: "100%",
    backgroundColor: "#0c151c",
    alignItems: "center",
    // justifyContent: "center",
    padding: 30,
    paddingBlockStart: 50,
    gap: 20,
    // borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
    position: "relative",
  },
  mainHeading: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  otpSubheading: {
    fontSize: 12,
    color: "#fff",
    textAlign: "center",
    lineHeight: 17,
  },
  inputContainer: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    // backgroundColor:'red'
  },
  otpInput: {
    backgroundColor: "gray",

    width: 40,
    height: 40,
    textAlign: "center",
    borderRadius: 7,
    fontWeight: "600",
    fontSize: 16,
    color: "#2c2c2c",
    carretColor: "#000",
  },
  verifyButton: {
    width: "100%",
    height: 40,
    backgroundColor: "#008068",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  verifyText: {
    color: "#fff",
    fontWeight: "600",
  },

  // exitText: {
  //   fontSize: 18,
  //   color: "#000",
  // },
  resendNote: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  resendText: {
    fontSize: 12,
    color: "#fff",
  },
  resendBtn: {
    fontSize: 14,
    fontWeight: "700",
    color: "#008068",
  },
});

export default OtpForm;
