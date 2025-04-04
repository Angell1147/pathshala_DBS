import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons"; // Make sure to install @expo/vector-icons if not already

const BACKEND_URL = process.env.BACKEND_URL;
export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const BACKEND_URL = "http://127.0.0.1:5000";

  // Function to send OTP
  const handleSendOTP = async () => {
    if (!email) {
      setError("Email is required");
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/otp_generator`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        setOtpSent(true);
        setError(""); // Clear errors
        Alert.alert("Success", "OTP sent to your email.");
      } else {
        setError(data.error || "Failed to send OTP.");
      }
    } catch (err) {
      setError("Network error. Try again.");
    }
  };

  // Function to verify OTP
  const handleVerifyOTP = async () => {
    if (!otp) {
      setError("OTP is required");
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/teacher_login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
      if (response.ok) {
        router.replace("/Tindex");
        await AsyncStorage.setItem("session_token", data.session_token);
        localStorage.setItem("session_token", data.session_token);
        console.log("Login successful:", data);
      } else {
        setError(data.message || "Incorrect OTP. Try again.");
      }
    } catch (err) {
      setError("Network error. Try again.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <Text style={styles.title}>Login</Text>

      {/* Email Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Send OTP Button (only visible before OTP is sent) */}
      {!otpSent && <Button title="Send OTP" onPress={handleSendOTP} />}

      {/* OTP Input (only visible after OTP is sent) */}
      {otpSent && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
          />
          <Button title="Verify OTP" onPress={handleVerifyOTP} />
        </>
      )}

      {/* Error Message */}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "lightblue",
  },
  title: {
    fontSize: 30,
    marginBottom: 20,
    color: "#2A96A7",
  },
  input: {
    width: "80%",
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 8,
    backgroundColor: "white",
  },
  error: {
    color: "red",
    marginTop: 10,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    padding: 10,
  },
});
