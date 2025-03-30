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

export default function HomeScreen() {
  const { width } = Dimensions.get("window");
  const isSmallScreen = width < 600;
  const isMobile = width < 400;

  return (
    <View style={styles.mainContainer}>
      {/* Main Content Area */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Link href="/login" asChild>
            <Pressable style={styles.loginButton}>
              <Image
                source={require("@/assets/images/login-icon2.png")}
                style={styles.loginIcon}
              />
            </Pressable>
          </Link>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}

        {/* Cards Container */}
        <View style={styles.cardsWrapper}>
          <View style={styles.cardsContainer}>
            {/* Classroom Picker Card */}
            <Pressable
              style={({ pressed }) => [
                styles.card,
                { opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Link href="/CP" asChild>
                <View style={styles.cardContent}>
                  <View
                    style={[styles.cardImageContainer, styles.placeholderImage]}
                  />
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
              ]}
            >
              <Link href="/TT" asChild>
                <View style={styles.cardContent}>
                  <View
                    style={[styles.cardImageContainer, styles.placeholderImage]}
                  />
                  <ThemedText style={styles.cardTitle}>Time Table</ThemedText>
                  <ThemedText style={styles.cardDescription}>
                    View and manage your schedule
                  </ThemedText>
                </View>
              </Link>
            </Pressable>
          </View>
        </View>

        {/* Additional Content Section */}
        <View style={styles.infoWrapper}>
          <ThemedView style={styles.infoSection}>
            <ThemedText style={styles.infoTitle}>
              Welcome to Your Dashboard
            </ThemedText>
            <ThemedText style={styles.infoDescription}>
              Manage your classroom activities and schedule with our intuitive
              tools. Select a card above to get started or use the navigation
              menu below.
            </ThemedText>
          </ThemedView>
        </View>
      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <Link href="/" asChild>
            <Pressable style={styles.footerButton}>
              <Text style={styles.footerButtonText}>Dashboard</Text>
            </Pressable>
          </Link>

          <Link href="/TT" asChild>
            <Pressable style={styles.footerButton}>
              <Text style={styles.footerButtonText}>Time Table</Text>
            </Pressable>
          </Link>

          <Link href="/CP" asChild>
            <Pressable style={styles.footerButton}>
              <Text style={styles.footerButtonText}>Classroom</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  header: {
    height: 120,
    backgroundColor: "#2a96a7",
    justifyContent: "center",
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    width: "100%",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  loginButton: {
    position: "absolute",
    right: 20,
  },
  loginIcon: {
    width: 30,
    height: 30,
    tintColor: "white",
  },
  cardsWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  cardsContainer: {
    width: "100%",
    maxWidth: 800,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 20,
  },
  card: {
    width: 300,
    height: 220,
    backgroundColor: "#2a96a7",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  cardImageContainer: {
    width: 120,
    height: 80,
    borderRadius: 8,
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  cardTitle: {
    fontSize: 22,
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
    paddingHorizontal: 10,
  },
  infoWrapper: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  infoSection: {
    width: "100%",
    maxWidth: 800,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2a96a7",
    marginBottom: 12,
    textAlign: "center",
  },
  infoDescription: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    lineHeight: 22,
  },
  footer: {
    width: "100%",
    backgroundColor: "#2a96a7",
    paddingVertical: 14,
    paddingBottom: Platform.OS === "ios" ? 28 : 14,
  },
  footerContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
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
