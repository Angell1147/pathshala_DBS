import { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const handleVerifyOTP = () => {
    if (otp === "1234") {
        router.replace("/Tindex");
    } else {
      setError("Incorrect OTP. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      
        <TextInput
            style={styles.input}
            placeholder="Enter Email"
            value={email}
            onChangeText={setEmail}
        />
        <TextInput
            style={styles.input}
            placeholder="Confirm Email"
            value={confirmEmail}
            onChangeText={setConfirmEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter OTP"
          value={otp}
          onChangeText={setOtp}
          keyboardType="numeric"
        />
      {/* Error Message */}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Verify OTP Button */}
      <Button title="Verify OTP" onPress={handleVerifyOTP} />
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
    marginBottom: 10,
  },
});
