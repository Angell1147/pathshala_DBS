import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Pressable,
  Image,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";
import React, { useContext, useState, useEffect } from "react";
import { FetchD } from "@/context/FetchD";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link } from "expo-router";

export default function TabTwoScreen() {
  const { width } = Dimensions.get("window");
  const router = useRouter();
  const fetchDContext = useContext(FetchD);
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

  const { filteredSlots, setSelectedDay, setSelectedClassroom } = fetchDContext;
  const [selectedClassroom, setSelectedClassroomLocal] = useState("All");
  const [selectedDay, setSelectedDayLocal] = useState("All");
  const [isClassroomDropdownOpen, setIsClassroomDropdownOpen] = useState(false);
  const [isDayDropdownOpen, setIsDayDropdownOpen] = useState(false);

  const days = ["All", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const classrooms = [
    "All",
    ...new Set(filteredSlots.map((slot) => slot.classroom_id)),
  ];
  if (!fetchDContext || !sessionVerified) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.mainContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Classroom</Text>
          <Pressable style={styles.logoutButton} onPress={logout}>
            <Image
              source={require("@/assets/images/logout-icon.png")}
              style={styles.logoutIcon}
            />
          </Pressable>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Filter Dropdowns */}
        <View style={styles.filterContainer}>
          {/* Classroom Dropdown */}
          <View style={styles.dropdownWrapper}>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => {
                setIsClassroomDropdownOpen(!isClassroomDropdownOpen);
                setIsDayDropdownOpen(false);
              }}
            >
              <Text style={styles.dropdownButtonText}>{selectedClassroom}</Text>
            </TouchableOpacity>
            {isClassroomDropdownOpen && (
              <View style={styles.dropdownContainer}>
                {classrooms.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedClassroomLocal(item);
                      setSelectedClassroom(item);
                      setIsClassroomDropdownOpen(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Day Dropdown */}
          <View style={styles.dropdownWrapper}>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => {
                setIsDayDropdownOpen(!isDayDropdownOpen);
                setIsClassroomDropdownOpen(false);
              }}
            >
              <Text style={styles.dropdownButtonText}>{selectedDay}</Text>
            </TouchableOpacity>
            {isDayDropdownOpen && (
              <View style={styles.dropdownContainer}>
                {days.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedDayLocal(item);
                      setSelectedDay(item);
                      setIsDayDropdownOpen(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Available Classrooms */}
        <Text style={styles.availableClassroomsText}>
          Available Classrooms:
        </Text>
        <FlatList
          data={filteredSlots}
          scrollEnabled={false}
          keyExtractor={(item, index) =>
            `${item.classroom_id}-${item.free_start}-${index}`
          }
          renderItem={({ item }) => (
            <View style={styles.classroomCard}>
              <Text style={styles.cardText}>
                {item.classroom_id} • {item.day}
              </Text>
              <Text style={styles.cardText}>
                {item.free_start} - {item.free_end}
              </Text>
            </View>
          )}
        />
      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        <Link href="/Tindex" asChild>
          <Pressable style={styles.footerButton}>
            <Text style={styles.footerButtonText}>Home</Text>
          </Pressable>
        </Link>
        <Link href="/TT2" asChild>
          <Pressable style={styles.footerButton}>
            <Text style={styles.footerButtonText}>Time Table</Text>
          </Pressable>
        </Link>
        <Link href="/CP2" asChild>
          <Pressable style={styles.footerButton}>
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
    backgroundColor: "#f8f9fa",
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
  logoutButton: {
    position: "absolute",
    right: 20,
  },
  logoutIcon: {
    width: 30,
    height: 30,
    tintColor: "white",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dropdownWrapper: {
    width: "48%",
    position: "relative",
  },
  dropdownButton: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#CBD5E0",
    borderRadius: 8,
    backgroundColor: "white",
    padding: 12,
    alignItems: "center",
  },
  dropdownButtonText: {
    fontSize: 16,
    color: "#4A5568",
  },
  dropdownContainer: {
    position: "absolute",
    top: 50,
    width: "100%",
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CBD5E0",
    zIndex: 10,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF2F7",
  },
  dropdownItemText: {
    fontSize: 16,
    textAlign: "center",
    color: "#4A5568",
  },
  availableClassroomsText: {
    fontSize: 20,
    color: "#59788E",
    fontWeight: "bold",
    marginVertical: 16,
  },
  classroomCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardText: {
    fontSize: 16,
    color: "#4A5568",
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
