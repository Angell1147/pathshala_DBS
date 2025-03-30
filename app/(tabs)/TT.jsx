import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Dimensions,
  Image,
  Pressable,
  Platform,
} from "react-native";
import React, { useState, useEffect, useContext, useCallback } from "react";
import { FetchD } from "@/context/FetchD";
import { Link } from "expo-router";

export default function TimeTableScreen() {
  const { width } = Dimensions.get("window");
  const isSmallScreen = width < 600;

  const [viewMode, setViewMode] = useState("classroom");
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [isClassroomDropdownOpen, setIsClassroomDropdownOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [isBatchDropdownOpen, setIsBatchDropdownOpen] = useState(false);
  const [timetable, setTimetable] = useState([]);
  const [uniqueClassrooms, setUniqueClassrooms] = useState([]);
  const [uniqueBatches, setUniqueBatches] = useState([]);
  const [key, setKey] = useState(0);

  const fetchDContext = useContext(FetchD);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const timeSlots = [
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

  useEffect(() => {
    if (fetchDContext && fetchDContext.bookedSlots) {
      const classrooms = [
        ...new Set(
          fetchDContext.bookedSlots.map((slot) => slot.classroom_name)
        ),
      ];
      setUniqueClassrooms(classrooms);

      const batches = [
        ...new Set(fetchDContext.bookedSlots.map((slot) => slot.subject_name)),
      ];
      setUniqueBatches(batches);

      if (classrooms.length > 0 && !selectedClassroom) {
        setSelectedClassroom(classrooms[0]);
      }

      if (batches.length > 0 && !selectedBatch) {
        setSelectedBatch(batches[0]);
      }
    }
  }, [fetchDContext?.bookedSlots]);

  const updateTimetable = useCallback(() => {
    if (fetchDContext?.bookedSlots) {
      let filteredTimetable = [];

      if (viewMode === "classroom" && selectedClassroom) {
        filteredTimetable = fetchDContext.bookedSlots.filter(
          (slot) => slot.classroom_name === selectedClassroom
        );
      } else if (viewMode === "batch" && selectedBatch) {
        filteredTimetable = fetchDContext.bookedSlots.filter(
          (slot) => slot.subject_name === selectedBatch
        );
      }

      setTimetable(filteredTimetable);
      setKey((prevKey) => prevKey + 1);
    }
  }, [viewMode, selectedClassroom, selectedBatch, fetchDContext?.bookedSlots]);

  useEffect(() => {
    updateTimetable();
  }, [updateTimetable]);

  const handleClassroomChange = (room) => {
    setSelectedClassroom(room);
    setIsClassroomDropdownOpen(false);
  };

  const handleBatchChange = (batch) => {
    setSelectedBatch(batch);
    setIsBatchDropdownOpen(false);
  };

  const matchesTimeSlot = (slot, timeSlotStr) => {
    const [startTime] = timeSlotStr.split(" - ");
    const formattedStartTime = startTime + ":00";
    return slot.start_time === formattedStartTime;
  };

  const toggleViewMode = () => {
    setViewMode((prevMode) => {
      const newMode = prevMode === "classroom" ? "batch" : "classroom";
      setIsClassroomDropdownOpen(false);
      setIsBatchDropdownOpen(false);
      setTimeout(() => updateTimetable(), 0);
      return newMode;
    });
  };

  return (
    <View style={styles.mainContainer} key={key}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Time Table</Text>
          <Link href="/login" asChild>
            <Pressable style={styles.logoutButton}>
              <Image
                source={require("@/assets/images/login-icon2.png")}
                style={styles.logoutIcon}
              />
            </Pressable>
          </Link>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
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

        {viewMode === "classroom" ? (
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => {
              setIsClassroomDropdownOpen(!isClassroomDropdownOpen);
              setIsBatchDropdownOpen(false);
            }}
          >
            <Text style={styles.dropdownButtonText}>
              {selectedClassroom || "Select a Classroom"}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => {
              setIsBatchDropdownOpen(!isBatchDropdownOpen);
              setIsClassroomDropdownOpen(false);
            }}
          >
            <Text style={styles.dropdownButtonText}>
              {selectedBatch || "Select a Batch"}
            </Text>
          </TouchableOpacity>
        )}

        {isClassroomDropdownOpen && (
          <View style={styles.dropdownContainer}>
            <ScrollView style={{ maxHeight: 200 }}>
              {uniqueClassrooms.map((room, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.slotItem}
                  onPress={() => handleClassroomChange(room)}
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

        {isBatchDropdownOpen && (
          <View style={styles.dropdownContainer}>
            <ScrollView style={{ maxHeight: 200 }}>
              {uniqueBatches.map((batch, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.slotItem}
                  onPress={() => handleBatchChange(batch)}
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

        <View style={styles.timetableContainer}>
          <ScrollView style={styles.outerScrollView}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={true}
              style={styles.innerScrollView}
            >
              <View style={styles.grid}>
                <View style={styles.gridRow}>
                  <View style={styles.headerCell}>
                    <Text style={styles.headerCellText}>Time</Text>
                  </View>
                  {days.map((day, index) => (
                    <View key={index} style={styles.headerCell}>
                      <Text style={styles.headerCellText}>{day}</Text>
                    </View>
                  ))}
                </View>

                {timeSlots.map((slot, rowIndex) => (
                  <View key={rowIndex} style={styles.gridRow}>
                    <View style={styles.timeSlotCell}>
                      <Text style={styles.timeSlotText}>{slot}</Text>
                    </View>
                    {days.map((day, colIndex) => {
                      const entry = timetable.find(
                        (item) =>
                          item.day === day && matchesTimeSlot(item, slot)
                      );

                      return (
                        <View
                          key={`${day}-${slot}-${colIndex}`}
                          style={[styles.gridCell, entry && styles.filledCell]}
                        >
                          {entry ? (
                            <>
                              <Text style={styles.subjectText}>
                                {entry.teacher_name}
                              </Text>
                              <Text style={styles.teacherText}>
                                {viewMode === "classroom"
                                  ? entry.subject_name
                                  : entry.classroom_name}
                              </Text>
                              <Text style={styles.batchTeacherText}>
                                {entry.batch_name}
                              </Text>
                            </>
                          ) : null}
                        </View>
                      );
                    })}
                  </View>
                ))}
              </View>
            </ScrollView>
          </ScrollView>
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
    paddingBottom: 20,
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
  outerScrollView: {
    flex: 1,
  },
  innerScrollView: {
    flexGrow: 1,
  },
  grid: {
    padding: 10,
    minWidth: "100%",
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
    textAlign: "center",
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
    textAlign: "center",
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
    textAlign: "center",
  },
  teacherText: {
    fontSize: 12,
    color: "#4A5568",
    textAlign: "center",
    marginTop: 2,
  },
  batchTeacherText: {
    fontSize: 10,
    color: "#718096",
    textAlign: "center",
    marginTop: 2,
    fontStyle: "italic",
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
});
