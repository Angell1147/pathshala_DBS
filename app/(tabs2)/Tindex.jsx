import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Image,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen() {
  const { width } = Dimensions.get("window");
  const isSmallScreen = width < 600;
  const router = useRouter();
  const [sessionVerified, setSessionVerified] = useState(true);

  // Session verification
  useEffect(() => {
    const verifySession = async () => {
      try {
        const sessionId = await AsyncStorage.getItem("session_token");
        if (!sessionId) throw new Error("No session token");

        const response = await fetch(
          "http://192.168.0.210:5000/verify_session",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionId}`,
            },
          }
        );

        if (!response.ok) throw new Error("Session verification failed");
        setSessionVerified(true);
      } catch (error) {
        console.error(error);
        setSessionVerified(false);
        router.push("/");
      }
    };

    verifySession();
  }, []);

  // Logout function
  const logout = async () => {
    try {
      await AsyncStorage.removeItem("session_token");
      await fetch("http://192.168.0.210:5000/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await AsyncStorage.getItem(
            "session_token"
          )}`,
        },
      });
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!sessionVerified) return null;

  const navigateTo = (route) => {
    router.push(route);
  };

  return (
    <View style={styles.mainContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Teacher's Portal</Text>
        <Pressable style={styles.logoutButton} onPress={logout}>
          <Image
            source={require("@/assets/images/logout-icon.png")}
            style={styles.logoutIcon}
          />
        </Pressable>
      </View>

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.buttonsContainer}>
          <Pressable
            style={[
              styles.button,
              isSmallScreen ? styles.buttonMobile : styles.buttonDesktop,
            ]}
            onPress={() => navigateTo("/CP")}
          >
            <Text style={styles.buttonText}>Classroom Picker</Text>
          </Pressable>

          <Pressable
            style={[
              styles.button,
              isSmallScreen ? styles.buttonMobile : styles.buttonDesktop,
            ]}
            onPress={() => navigateTo("/TT2")}
          >
            <Text style={styles.buttonText}>Time Table</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        <Pressable
          style={styles.footerButton}
          onPress={() => navigateTo("/Tindex")}
        >
          <Text style={styles.footerButtonText}>Dashboard</Text>
        </Pressable>
        <Pressable
          style={styles.footerButton}
          onPress={() => navigateTo("/TT2")}
        >
          <Text style={styles.footerButtonText}>Time Table</Text>
        </Pressable>
        <Pressable
          style={styles.footerButton}
          onPress={() => navigateTo("/CP2")}
        >
          <Text style={styles.footerButtonText}>Classroom</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    height: 120,
    backgroundColor: "#2a96a7",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  logoutButton: {
    position: "absolute",
    right: 20,
    top: Platform.OS === "ios" ? 50 : 30,
  },
  logoutIcon: {
    width: 30,
    height: 30,
    tintColor: "white",
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  buttonsContainer: {
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  button: {
    borderRadius: 12,
    backgroundColor: "rgba(42,150,167,0.75)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonMobile: {
    height: 150,
    width: "100%",
  },
  buttonDesktop: {
    height: 200,
    width: "80%",
    maxWidth: 400,
  },
  buttonText: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
    padding: 20,
  },
  footer: {
    width: "100%",
    backgroundColor: "#2a96a7",
    paddingVertical: 14,
    paddingBottom: Platform.OS === "ios" ? 28 : 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.2)",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  footerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  footerButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
});
