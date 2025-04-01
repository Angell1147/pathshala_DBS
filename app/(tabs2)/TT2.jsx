import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
  Button,
  Dimensions,
  Platform,
  Pressable,
  Image,
  Alert,
} from "react-native";
import React, { useState, useEffect, useContext, useCallback } from "react";
import { FetchD } from "@/context/FetchD";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, Link } from "expo-router";
import { useFocusEffect } from "expo-router";

export default function TimeTableScreen() {
  const { width } = Dimensions.get("window");
  const router = useRouter();
  const fetchDContext = useContext(FetchD);
  const { bookedSlots } = fetchDContext;

  // Authentication state
  const [sessionVerified, setSessionVerified] = useState(true);
  const [teacherName, setTeacherName] = useState("");

  // View mode state
  const [viewMode, setViewMode] = useState("classroom");
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState({
    classroom: false,
    batch: false,
  });

  // Data state
  const [timetable, setTimetable] = useState([]);
  const [uniqueClassrooms, setUniqueClassrooms] = useState([]);
  const [uniqueBatches, setUniqueBatches] = useState([]);
  const [uniqueSubjects, setUniqueSubjects] = useState([]);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedBatchToSchedule, setSelectedBatchToSchedule] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Add new state for modal dropdowns
  const [showBatchDropdown, setShowBatchDropdown] = useState(false);
  const [showClassroomDropdown, setShowClassroomDropdown] = useState(false);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);

  // Add state to force re-render
  const [renderKey, setRenderKey] = useState(Date.now());

  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const TIME_SLOTS = [
    "08:30 - 09:30",
    "09:30 - 10:30",
    "10:30 - 11:30",
    "11:30 - 12:30",
    "12:30 - 13:30",
    "13:30 - 14:30",
    "14:30 - 15:30",
    "15:30 - 16:30",
    "16:30 - 17:30",
    "17:30 - 18:30",
  ];

  // Session verification
  useEffect(() => {
    const verifySession = async () => {
      try {
        const sessionId = await AsyncStorage.getItem("session_token");
        if (!sessionId) throw new Error("No session token");

        const [sessionResponse, profileResponse] = await Promise.all([
          fetch("http://127.0.0.1:5000/verify_session", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionId}`,
            },
          }),
          fetch("http://127.0.0.1:5000/teacher_profile", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionId}`,
            },
          }),
        ]);

        if (!sessionResponse.ok) throw new Error("Session verification failed");

        const profileData = await profileResponse.json();
        setTeacherName(profileData.name || "Teacher");
        setSessionVerified(true);
      } catch (error) {
        console.error("Session error:", error);
        setSessionVerified(false);
        router.push("/");
      }
    };

    verifySession();
  }, []);

  // Initialize data
  useEffect(() => {
    if (bookedSlots?.length) {
      const classrooms = [...new Set(bookedSlots.map((s) => s.classroom_name))];
      const batches = [...new Set(bookedSlots.map((s) => s.batch_name))];
      const subjects = [...new Set(bookedSlots.map((s) => s.subject_name))];

      setUniqueClassrooms(classrooms);
      setUniqueBatches(batches);
      setUniqueSubjects(subjects);

      if (!selectedClassroom) setSelectedClassroom(classrooms[0]);
      if (!selectedBatch) setSelectedBatch(batches[0]);
    }
  }, [bookedSlots]);

  // Update timetable when filters change
  const updateTimetable = useCallback(() => {
    if (!bookedSlots || !selectedClassroom || !selectedBatch) return;

    const filtered =
      viewMode === "classroom"
        ? bookedSlots.filter((s) => s.classroom_name === selectedClassroom)
        : bookedSlots.filter((s) => s.batch_name === selectedBatch);

    setTimetable(filtered);
    // Update render key to force re-render
    setRenderKey(Date.now());
  }, [viewMode, selectedClassroom, selectedBatch, bookedSlots]);

  useEffect(() => {
    updateTimetable();
  }, [updateTimetable]);

  // Function to force re-render all timetable cells
  const forceRenderAllCells = async () => {
    try {
      const sessionId = await AsyncStorage.getItem("session_token");
      if (!sessionId) throw new Error("No session token");

      // Fetch fresh data
      const response = await fetch("http://127.0.0.1:5000/allTimeSlots", {
        headers: {
          Authorization: `Bearer ${sessionId}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch updated time slots");
      }

      const updatedData = await response.json();

      // Update context with new data
      fetchDContext.setBookedSlots(updatedData);

      // Filter based on current view
      const filtered =
        viewMode === "classroom"
          ? updatedData.filter((s) => s.classroom_name === selectedClassroom)
          : updatedData.filter((s) => s.batch_name === selectedBatch);

      // Update timetable with filtered data
      setTimetable(filtered);

      // Force re-render by updating the key

      setRenderKey(Date.now());
    } catch (error) {
      console.error("Error refreshing timetable:", error);
    }
  };

  // handle slot deletion
  const deleteSlot = async (slot) => {
    try {
      const sessionId = await AsyncStorage.getItem("session_token");
      if (!sessionId) throw new Error("No session token");

      const response = await fetch("http://127.0.0.1:5000/delete_time_slot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionId}`,
        },
        body: JSON.stringify({
          start_time: slot.start_time,
          end_time: slot.end_time,
          day: slot.day,
          subject_name: slot.subject_name,
          classroom_name: slot.classroom_name,
          batch_name: slot.batch_name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        Alert.alert("Error", "Failed to delete the slot. Please try again.");
        return;
      }

      // Refresh timetable after deletion
      await forceRenderAllCells();
      Alert.alert("Success", "Slot deleted successfully.");
    } catch (error) {
      console.error("Delete error:", error);
      Alert.alert("Error", "Network error. Please try again.");
    }
  };

  // Helper functions
  const matchesTimeSlot = (slot, timeSlotStr) => {
    const [startTime] = timeSlotStr.split(" - ");
    return slot.start_time === `${startTime}:00`;
  };

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "classroom" ? "batch" : "classroom"));
    setIsDropdownOpen({ classroom: false, batch: false });
  };

  const toggleDropdown = (type) => {
    setIsDropdownOpen((prev) => ({
      classroom: type === "classroom" ? !prev.classroom : false,
      batch: type === "batch" ? !prev.batch : false,
    }));
  };

  const openModal = (day, slot) => {
    const [start_time, end_time] = slot.split(" - ");
    const entry = timetable.find(
      (item) => item.day === day && matchesTimeSlot(item, slot)
    );

    if (entry) {
      console.log("Slot already booked:", entry);
      return;
    }

    setSelectedSlot({ day, start_time, end_time });
    setModalVisible(true);
  };

  const handleSchedule = async () => {
    let errorMessage = "";
    if (viewMode === "classroom" && !selectedBatchToSchedule) {
      errorMessage = "Please select a batch";
    }
    if (viewMode === "batch" && !selectedClassroom) {
      errorMessage = "Please select a classroom";
    }
    if (!selectedSubject) {
      errorMessage = "Please select a subject";
    }

    if (errorMessage) {
      Alert.alert("Error", errorMessage);
      return;
    }

    try {
      const sessionId = await AsyncStorage.getItem("session_token");
      if (!sessionId) throw new Error("No session token");

      const requestBody = {
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        day: selectedSlot.day,
        subject_name: selectedSubject,
        ...(viewMode === "classroom"
          ? {
              classroom_name: selectedClassroom,
              batch_name: selectedBatchToSchedule,
            }
          : {
              classroom_name: selectedClassroom,
              batch_name: selectedBatch,
            }),
      };
      console.log("Request Body:", requestBody);

      const response = await fetch("http://127.0.0.1:5000/add_time_slot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionId}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        Alert.alert("Error", "Failed to schedule. Please try again.");
        return;
      }
      window.location.reload();

      // Force refresh the timetable data and re-render
      await forceRenderAllCells();

      // Reset modal state
      setModalVisible(false);
      setSelectedBatchToSchedule(null);
      setSelectedSubject(null);

      Alert.alert("Success", "Slot scheduled successfully.");
    } catch (error) {
      console.error("Schedule error:", error);
      Alert.alert("Error", "Network error. Please try again.");
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("session_token");
      await fetch("http://127.0.0.1:5000/logout", {
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

  // Modal dropdowns rendering
  const renderModalDropdowns = () => {
    if (viewMode === "classroom") {
      return (
        <>
          {/* Batch Selection */}
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => {
              setShowBatchDropdown(!showBatchDropdown);
              setShowClassroomDropdown(false);
              setShowSubjectDropdown(false);
            }}
          >
            <Text style={styles.dropdownButtonText}>
              {selectedBatchToSchedule || "Select Batch"}
            </Text>
          </TouchableOpacity>

          {showBatchDropdown && (
            <View style={styles.dropdownContainer}>
              <ScrollView style={{ maxHeight: 100 }}>
                {uniqueBatches.map((batch, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.slotItem}
                    onPress={() => {
                      setSelectedBatchToSchedule(batch);
                      setShowBatchDropdown(false);
                    }}
                  >
                    <Text style={styles.slotText}>{batch}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </>
      );
    }

    if (viewMode === "batch") {
      return (
        <>
          {/* Classroom Selection */}
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => {
              setShowClassroomDropdown(!showClassroomDropdown);
              setShowBatchDropdown(false);
              setShowSubjectDropdown(false);
            }}
          >
            <Text style={styles.dropdownButtonText}>
              {selectedClassroom || "Select Classroom"}
            </Text>
          </TouchableOpacity>

          {showClassroomDropdown && (
            <View style={styles.dropdownContainer}>
              <ScrollView style={{ maxHeight: 100 }}>
                {uniqueClassrooms.map((room, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.slotItem}
                    onPress={() => {
                      setSelectedClassroom(room);
                      setShowClassroomDropdown(false);
                    }}
                  >
                    <Text style={styles.slotText}>{room}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </>
      );
    }
  };

  // Modal subject selection
  const renderSubjectDropdown = () => (
    <>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => {
          setShowSubjectDropdown(!showSubjectDropdown);
          setShowBatchDropdown(false);
          setShowClassroomDropdown(false);
        }}
      >
        <Text style={styles.dropdownButtonText}>
          {selectedSubject || "Select Subject"}
        </Text>
      </TouchableOpacity>

      {showSubjectDropdown && (
        <View style={styles.dropdownContainer}>
          <ScrollView style={{ maxHeight: 100 }}>
            {uniqueSubjects.map((subject, index) => (
              <TouchableOpacity
                key={index}
                style={styles.slotItem}
                onPress={() => {
                  setSelectedSubject(subject);
                  setShowSubjectDropdown(false);
                }}
              >
                <Text style={styles.slotText}>{subject}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </>
  );

  return (
    <View style={styles.mainContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Time Table</Text>
        <Pressable style={styles.logoutButton} onPress={logout}>
          <Image
            source={require("@/assets/images/logout-icon.png")}
            style={styles.logoutIcon}
          />
        </Pressable>
      </View>
      {/* Main Content */}
      <ScrollView style={styles.scrollView}>
        {/* View Mode Toggle */}
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>Classroom</Text>
          <Switch
            value={viewMode === "batch"}
            onValueChange={toggleViewMode}
            trackColor={{ false: "#767577", true: "#59788E" }}
            thumbColor="#f4f3f4"
          />
          <Text style={styles.toggleLabel}>Batch</Text>
        </View>

        {/* Dropdown Selector */}
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => toggleDropdown(viewMode)}
        >
          <Text style={styles.dropdownButtonText}>
            {viewMode === "classroom"
              ? selectedClassroom || "Select Classroom"
              : selectedBatch || "Select Batch"}
          </Text>
        </TouchableOpacity>

        {/* Dropdown Menus */}
        {isDropdownOpen.classroom && (
          <View style={styles.dropdownContainer}>
            <ScrollView style={{ maxHeight: 200 }}>
              {uniqueClassrooms.map((room, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.slotItem}
                  onPress={() => {
                    setSelectedClassroom(room);
                    setIsDropdownOpen({ classroom: false, batch: false });
                  }}
                >
                  <Text
                    style={[
                      styles.slotText,
                      selectedClassroom === room && styles.selectedItemText,
                    ]}
                  >
                    {room}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {isDropdownOpen.batch && (
          <View style={styles.dropdownContainer}>
            <ScrollView style={{ maxHeight: 200 }}>
              {uniqueBatches.map((batch, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.slotItem}
                  onPress={() => {
                    setSelectedBatch(batch);
                    setIsDropdownOpen({ classroom: false, batch: false });
                  }}
                >
                  <Text
                    style={[
                      styles.slotText,
                      selectedBatch === batch && styles.selectedItemText,
                    ]}
                  >
                    {batch}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Timetable Grid */}
        <View style={styles.timetableContainer}>
          <ScrollView horizontal>
            <View style={styles.grid} key={`grid-${renderKey}`}>
              {/* Header Row */}
              <View style={styles.gridRow}>
                <View style={styles.headerCell}>
                  <Text style={styles.headerCellText}>Time</Text>
                </View>
                {DAYS.map((day) => (
                  <View key={day} style={styles.headerCell}>
                    <Text style={styles.headerCellText}>{day}</Text>
                  </View>
                ))}
              </View>

              {/* Time Slots */}
              {TIME_SLOTS.map((slot) => (
                <View key={`row-${slot}-${renderKey}`} style={styles.gridRow}>
                  <View style={styles.timeSlotCell}>
                    <Text style={styles.timeSlotText}>{slot}</Text>
                  </View>
                  {DAYS.map((day) => {
                    const entry = timetable.find(
                      (item) => item.day === day && matchesTimeSlot(item, slot)
                    );

                    return (
                      <TouchableOpacity
                        key={`${day}-${slot}-${renderKey}-${
                          entry ? entry.subject_name : "empty"
                        }`}
                        style={[styles.gridCell, entry && styles.filledCell]}
                        onPress={() => !entry && openModal(day, slot)}
                      >
                        {entry ? (
                          <>
                            <Text style={styles.subjectText}>
                              {entry.subject_name}
                            </Text>
                            <Text style={styles.teacherText}>
                              {viewMode === "classroom"
                                ? entry.batch_name
                                : entry.classroom_name}
                            </Text>
                            <Text style={styles.batchTeacherText}>
                              {entry.teacher_name}
                            </Text>
                            {/* Add delete button */}
                            <TouchableOpacity
                              style={styles.deleteButton}
                              onPress={() => deleteSlot(entry)}
                            >
                              <Image
                                source={require("@/assets/images/delete-icon.svg")}
                                style={styles.deleteIcon}
                              />
                            </TouchableOpacity>
                          </>
                        ) : (
                          <Text style={styles.emptyCell}>+</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
      {/* Footer Navigation */}
      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <Link href="/Tindex" asChild>
            <Pressable style={styles.footerButton}>
              <Text style={styles.footerButtonText}>Dashboard</Text>
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
      {/* Scheduling Modal */}

      <Modal
        transparent
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Schedule {viewMode === "classroom" ? "Batch" : "Classroom"}
            </Text>
            <Text>Day: {selectedSlot?.day}</Text>
            <Text>
              Time: {selectedSlot?.start_time} - {selectedSlot?.end_time}
            </Text>

            {renderModalDropdowns()}
            {renderSubjectDropdown()}

            <View style={styles.modalButtons}>
              <Button title="Schedule" onPress={handleSchedule} />
              <Button
                title="Cancel"
                color="red"
                onPress={() => setModalVisible(false)}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  scrollView: {
    flex: 1,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginHorizontal: 10,
    color: "#59788E",
  },
  dropdownButton: {
    width: "90%",
    alignSelf: "center",
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#CBD5E0",
    borderRadius: 8,
    backgroundColor: "white",
    padding: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: "#4A5568",
    fontWeight: "500",
  },
  dropdownContainer: {
    width: "90%",
    alignSelf: "center",
    marginTop: 5,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CBD5E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 10,
  },
  slotItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF2F7",
  },
  slotText: {
    fontSize: 16,
    textAlign: "center",
    color: "#4A5568",
  },
  selectedItemText: {
    fontWeight: "bold",
    color: "#4299E1",
  },
  timetableContainer: {
    flex: 1,
    margin: 16,
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  grid: {
    padding: 10,
  },
  gridRow: {
    flexDirection: "row",
    minHeight: 80,
  },
  headerCell: {
    width: 120,
    padding: 12,
    backgroundColor: "#59788E",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  headerCellText: {
    color: "white",
    fontWeight: "bold",
  },
  timeSlotCell: {
    width: 120,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EDF2F7",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  timeSlotText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#4A5568",
  },
  gridCell: {
    width: 120,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 5,
    backgroundColor: "#F7FAFC",
  },
  filledCell: {
    backgroundColor: "#EBF8FF",
    borderColor: "#BEE3F8",
  },
  subjectText: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#2C5282",
  },
  teacherText: {
    fontSize: 12,
    color: "#4A5568",
    marginTop: 2,
  },
  batchTeacherText: {
    fontSize: 10,
    color: "#718096",
    marginTop: 2,
    fontStyle: "italic",
  },
  emptyCell: {
    fontSize: 20,
    color: "#CBD5E0",
  },
  deleteButton: {
    position: "absolute",
    top: 5,
    right: 5,
    padding: 5,
    backgroundColor: "#4682B4",
    borderRadius: 15,
  },
  deleteIcon: {
    width: 12,
    height: 12,
    tintColor: "white",
  },
  footer: {
    width: "100%",
    backgroundColor: "#2a96a7",
    paddingVertical: 14,
    paddingBottom: Platform.OS === "ios" ? 28 : 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.2)",
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
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2C5282",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
});
