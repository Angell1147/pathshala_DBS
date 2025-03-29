import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
} from "react-native";
import React, { useState, useEffect, useContext, useCallback } from "react";
import { ThemedText } from "@/components/ThemedText";
import { FetchD } from "../../context/FetchD";

export default function TimeTableScreen() {
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
    <View style={styles.container} key={key}>
      <ThemedText style={styles.title}>Time Table</ThemedText>

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
          onPress={() => setIsClassroomDropdownOpen(!isClassroomDropdownOpen)}
        >
          <Text style={styles.dropdownButtonText}>
            {selectedClassroom || "Select a Classroom"}
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setIsBatchDropdownOpen(!isBatchDropdownOpen)}
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
                      (item) => item.day === day && matchesTimeSlot(item, slot)
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

      {/* <View style={styles.debugContainer}>
        <Text style={styles.debugText}>
          Mode: {viewMode} | Selected:{" "}
          {viewMode === "classroom" ? selectedClassroom : selectedBatch}
        </Text>
        <Text style={styles.debugText}>Entries: {timetable.length}</Text>
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F5F7FA",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#59788E",
    textAlign: "center",
    marginBottom: 20,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginHorizontal: 10,
    color: "#59788E",
  },
  dropdownButton: {
    width: "100%",
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
    marginTop: 20,
    backgroundColor: "white",
    borderRadius: 8,
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
    width: 100,
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
    width: 100,
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
    width: 100,
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
  debugContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#1A202C",
    borderRadius: 4,
  },
  debugText: {
    color: "#A0AEC0",
    fontSize: 12,
  },
});
