import {
  Image,
  StyleSheet,
  Platform,
  Pressable,
  ScrollView,
  Dimensions,
} from "react-native";
import { View, Text } from "react-native";
import { HelloWave } from "@/components/HelloWave";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Link } from "expo-router";
import React from "react";
// import '@api/login';

export default function HomeScreen() {
  const { width } = Dimensions.get("window");
  const isSmallScreen = width < 600;

  return (
    <View style={styles.mainContainer}>
      {/* Main Content Area */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <HelloWave style={styles.wave} />
          <ThemedText style={styles.headerTitle}>Dashboard</ThemedText>
          <Link href="/login" asChild>
            <Pressable style={{ position: "absolute", top: 20, right: 20 }}>
              <Image
                source={require("@/assets/images/login-icon2.png")}
                style={{ width: 30, height: 30 }}
              />
            </Pressable>
          </Link>
        </View>

        {/* Cards Container */}
        <ThemedView
          style={[
            styles.cardsContainer,
            { flexDirection: isSmallScreen ? "column" : "row" },
          ]}
        >
          {/* Classroom Picker Card */}
          <Pressable
            style={({ pressed }) => [
              styles.card,
              { opacity: pressed ? 0.8 : 1 },
              isSmallScreen ? { width: "90%" } : { width: "45%" },
            ]}
          >
            <Link href="/CP" asChild>
              <View style={styles.cardContent}>
                <View
                  style={[styles.cardImageContainer, styles.placeholderImage]}
                >
                  {/* Image placeholder instead of actual image */}
                </View>
                <ThemedText style={styles.cardTitle}>
                  Classroom Picker
                </ThemedText>
                <ThemedText style={styles.cardDescription}>
                  Select and manage your classroom settings
                </ThemedText>
              </View>
            </Link>
          </Pressable>

          {/* Time Table Card */}
          <Pressable
            style={({ pressed }) => [
              styles.card,
              { opacity: pressed ? 0.8 : 1 },
              isSmallScreen ? { width: "90%" } : { width: "45%" },
            ]}
          >
            <Link href="/TT" asChild>
              <View style={styles.cardContent}>
                <View
                  style={[styles.cardImageContainer, styles.placeholderImage]}
                >
                  {/* Image placeholder instead of actual image */}
                </View>
                <ThemedText style={styles.cardTitle}>Time Table</ThemedText>
                <ThemedText style={styles.cardDescription}>
                  View and manage your schedule
                </ThemedText>
              </View>
            </Link>
          </Pressable>
        </ThemedView>

        {/* Additional Content Section */}
        <ThemedView style={styles.infoSection}>
          <ThemedText style={styles.infoTitle}>
            Welcome to Your Dashboard
          </ThemedText>
          <ThemedText style={styles.infoDescription}>
            Manage your classroom activities and schedule with our intuitive
            tools. Select a card above to get started or use the navigation menu
            below.
          </ThemedText>
        </ThemedView>
      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        <Link href="/" asChild>
          <Pressable
            style={({ pressed }) => [
              styles.footerButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={styles.footerButtonText}>Dashboard</Text>
          </Pressable>
        </Link>

        <Link href="/TT" asChild>
          <Pressable
            style={({ pressed }) => [
              styles.footerButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={styles.footerButtonText}>Time Table</Text>
          </Pressable>
        </Link>

        <Link href="/CP" asChild>
          <Pressable
            style={({ pressed }) => [
              styles.footerButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={styles.footerButtonText}>Classroom</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f0f8ff", // Light blue background
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    height: 180,
    backgroundColor: "#2a96a7",
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 20,
    marginBottom: 20,
  },
  wave: {
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  cardsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    flexWrap: "wrap",
    padding: 10,
    paddingVertical: 140,
    gap: 16,
    backgroundColor: "aliceblue",
  },
  card: {
    height: 300,
    backgroundColor: "rgba(42,150,167,0.75)",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    margin: 8,
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  cardImageContainer: {
    width: "80%",
    height: 150,
    borderRadius: 8,
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  placeholderImage: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
    textAlign: "center",
  },
  cardDescription: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    opacity: 0.9,
  },
  infoSection: {
    margin: 16,
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2a96a7",
    marginBottom: 12,
    textAlign: "center",
  },
  infoDescription: {
    fontSize: 16,
    color: "#444",
    textAlign: "center",
    lineHeight: 24,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#2a96a7",
    paddingVertical: 16,
    paddingBottom: Platform.OS === "ios" ? 30 : 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  footerButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  footerButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
