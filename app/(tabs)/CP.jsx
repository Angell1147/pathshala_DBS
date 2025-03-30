import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Switch,
  ScrollView,
} from "react-native";
import React, { useContext, useState, useEffect } from "react";
import { FetchD } from "@/context/FetchD";

export default function ClassroomPickerScreen() {
  const fetchDContext = useContext(FetchD);
  const [viewMode, setViewMode] = useState("classroom"); // "classroom" or "batch"
  const [classrooms, setClassrooms] = useState([]);
  const [batches, setBatches] = useState([]);
  const [timeSlots, setTimeSlots] = useState([
    "All",
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
  ]);
  const [selectedClassroom, setSelectedClassroomLocal] = useState("");
  const [selectedBatch, setSelectedBatchLocal] = useState("");
  const [selectedDay, setSelectedDayLocal] = useState("All");
  const [selectedTimeSlot, setSelectedTimeSlotLocal] = useState("All");
  const [isClassroomDropdownOpen, setIsClassroomDropdownOpen] = useState(false);
  const [isBatchDropdownOpen, setIsBatchDropdownOpen] = useState(false);
  const [isDayDropdownOpen, setIsDayDropdownOpen] = useState(false);
  const [isTimeSlotDropdownOpen, setIsTimeSlotDropdownOpen] = useState(false);
  const [filteredResults, setFilteredResults] = useState([]);

  const days = ["All", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  // Handle loading state
  if (!fetchDContext) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Extract unique classrooms and batches from context
  useEffect(() => {
    if (fetchDContext.freeSlots) {
      const uniqueClassrooms = [
        ...new Set(fetchDContext.freeSlots.map((slot) => slot.classroom_name)),
      ];
      setClassrooms(uniqueClassrooms);

      // Set default classroom selection if available
      if (uniqueClassrooms.length > 0 && !selectedClassroom) {
        setSelectedClassroomLocal(uniqueClassrooms[0]);
      }
    }

    if (fetchDContext.freeBatchSlots) {
      const uniqueBatches = [
        ...new Set(fetchDContext.freeBatchSlots.map((slot) => slot.batch_name)),
      ];
      setBatches(uniqueBatches);

      // Set default batch selection if available
      if (uniqueBatches.length > 0 && !selectedBatch) {
        setSelectedBatchLocal(uniqueBatches[0]);
      }
    }
  }, [fetchDContext.freeSlots, fetchDContext.freeBatchSlots]);

  // Filter slots based on selections
  useEffect(() => {
    let results = [];

    if (viewMode === "classroom" && selectedClassroom) {
      // Filter from freeSlots for classroom view
      results = fetchDContext.freeSlots.filter(
        (slot) => slot.classroom_name === selectedClassroom
      );
    } else if (viewMode === "batch" && selectedBatch) {
      // Filter from freeBatchSlots for batch view
      results = fetchDContext.freeBatchSlots.filter(
        (slot) => slot.batch_name === selectedBatch
      );
    }

    // Apply day filter
    if (selectedDay !== "All") {
      results = results.filter((slot) => slot.day === selectedDay);
    }

    // Apply time slot filter
    if (selectedTimeSlot !== "All") {
      results = results.filter((slot) => {
        const [startTime, endTime] = selectedTimeSlot.split(" - ");
        const slotStartTime = slot.free_start.substring(0, 5);
        const slotEndTime = slot.free_end.substring(0, 5);

        // Check if the selected time slot falls within the free slot's time range
        return slotStartTime <= startTime && slotEndTime >= endTime;
      });
    }

    setFilteredResults(results);
  }, [
    viewMode,
    selectedClassroom,
    selectedBatch,
    selectedDay,
    selectedTimeSlot,
    fetchDContext.freeSlots,
    fetchDContext.freeBatchSlots,
  ]);

  // Toggle between classroom and batch views
  const toggleViewMode = () => {
    setViewMode((prevMode) =>
      prevMode === "classroom" ? "batch" : "classroom"
    );
    // Close all dropdowns when toggling view
    setIsClassroomDropdownOpen(false);
    setIsBatchDropdownOpen(false);
    setIsDayDropdownOpen(false);
    setIsTimeSlotDropdownOpen(false);
  };

  // Handle classroom selection
  const handleClassroomSelect = (classroom) => {
    setSelectedClassroomLocal(classroom);
    if (fetchDContext.setSelectedClassroom) {
      fetchDContext.setSelectedClassroom(classroom);
    }
    setIsClassroomDropdownOpen(false);
  };

  // Handle batch selection
  const handleBatchSelect = (batch) => {
    setSelectedBatchLocal(batch);
    if (fetchDContext.setSelectedBatch) {
      fetchDContext.setSelectedBatch(batch);
    }
    setIsBatchDropdownOpen(false);
  };

  // Handle day selection
  const handleDaySelect = (day) => {
    setSelectedDayLocal(day);
    if (fetchDContext.setSelectedDay) {
      fetchDContext.setSelectedDay(day);
    }
    setIsDayDropdownOpen(false);
  };

  // Handle time slot selection
  const handleTimeSlotSelect = (timeSlot) => {
    setSelectedTimeSlotLocal(timeSlot);
    if (fetchDContext.setSelectedTimeSlot) {
      fetchDContext.setSelectedTimeSlot(timeSlot);
    }
    setIsTimeSlotDropdownOpen(false);
  };

  // Close all other dropdowns when opening one
  const openDropdown = (dropdown) => {
    setIsClassroomDropdownOpen(dropdown === "classroom");
    setIsBatchDropdownOpen(dropdown === "batch");
    setIsDayDropdownOpen(dropdown === "day");
    setIsTimeSlotDropdownOpen(dropdown === "timeSlot");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Classroom Picker</Text>

      {/* Toggle between Classroom and Batch view */}
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>Classroom</Text>
        <Switch
          value={viewMode === "batch"}
          onValueChange={toggleViewMode}
          trackColor={{ false: "#CBD5E0", true: "#59788E" }}
          thumbColor="#f4f3f4"
        />
        <Text style={styles.toggleLabel}>Batch</Text>
      </View>

      {/* Filter section */}
      <View style={styles.filtersContainer}>
        {/* Classroom/Batch Dropdown based on viewMode */}
        {viewMode === "classroom" ? (
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => openDropdown("classroom")}
          >
            <Text style={styles.dropdownButtonText}>
              {selectedClassroom || "Select Classroom"}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => openDropdown("batch")}
          >
            <Text style={styles.dropdownButtonText}>
              {selectedBatch || "Select Batch"}
            </Text>
          </TouchableOpacity>
        )}

        {/* Day Dropdown */}
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => openDropdown("day")}
        >
          <Text style={styles.dropdownButtonText}>
            {selectedDay || "Select Day"}
          </Text>
        </TouchableOpacity>

        {/* Time Slot Dropdown */}
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => openDropdown("timeSlot")}
        >
          <Text style={styles.dropdownButtonText}>
            {selectedTimeSlot || "Select Time Slot"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Dropdown Content */}
      {isClassroomDropdownOpen && (
        <View style={styles.dropdownContainer}>
          <ScrollView style={styles.dropdownScroll}>
            {classrooms.map((classroom, index) => (
              <TouchableOpacity
                key={index}
                style={styles.dropdownItem}
                onPress={() => handleClassroomSelect(classroom)}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    selectedClassroom === classroom && styles.selectedItemText,
                  ]}
                >
                  {classroom}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {isBatchDropdownOpen && (
        <View style={styles.dropdownContainer}>
          <ScrollView style={styles.dropdownScroll}>
            {batches.map((batch, index) => (
              <TouchableOpacity
                key={index}
                style={styles.dropdownItem}
                onPress={() => handleBatchSelect(batch)}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
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

      {isDayDropdownOpen && (
        <View style={styles.dropdownContainer}>
          <ScrollView style={styles.dropdownScroll}>
            {days.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={styles.dropdownItem}
                onPress={() => handleDaySelect(day)}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    selectedDay === day && styles.selectedItemText,
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {isTimeSlotDropdownOpen && (
        <View style={styles.dropdownContainer}>
          <ScrollView style={styles.dropdownScroll}>
            {timeSlots.map((timeSlot, index) => (
              <TouchableOpacity
                key={index}
                style={styles.dropdownItem}
                onPress={() => handleTimeSlotSelect(timeSlot)}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    selectedTimeSlot === timeSlot && styles.selectedItemText,
                  ]}
                >
                  {timeSlot}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Results Section */}
      <Text style={styles.resultsTitle}>
        {viewMode === "classroom"
          ? `Available Slots for ${selectedClassroom || "All Classrooms"}`
          : `Available Slots for ${selectedBatch || "All Batches"}`}
      </Text>

      {filteredResults.length > 0 ? (
        <FlatList
          data={filteredResults}
          keyExtractor={(item, index) =>
            `${item.day}-${item.free_start}-${index}`
          }
          renderItem={({ item }) => (
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultDay}>{item.day}</Text>
                <Text style={styles.resultType}>
                  {viewMode === "classroom"
                    ? item.classroom_name
                    : item.batch_name}
                </Text>
              </View>
              <View style={styles.resultTime}>
                <Text style={styles.resultTimeText}>
                  {item.free_start.substring(0, 5)} -{" "}
                  {item.free_end.substring(0, 5)}
                </Text>
              </View>
            </View>
          )}
        />
      ) : (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>
            No available slots match your filters
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F5F7FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  loadingText: {
    fontSize: 18,
    color: "#59788E",
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
  filtersContainer: {
    marginBottom: 10,
  },
  dropdownButton: {
    width: "100%",
    marginVertical: 6,
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
    marginBottom: 10,
  },
  dropdownScroll: {
    maxHeight: 200,
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
  selectedItemText: {
    fontWeight: "bold",
    color: "#4299E1",
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3748",
    marginVertical: 10,
    textAlign: "center",
  },
  resultCard: {
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: "hidden",
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#EBF8FF",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#BEE3F8",
  },
  resultDay: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C5282",
  },
  resultType: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4A5568",
  },
  resultTime: {
    padding: 15,
    alignItems: "center",
  },
  resultTimeText: {
    fontSize: 18,
    color: "#4A5568",
    fontWeight: "500",
  },
  noResultsContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF2F7",
    borderRadius: 8,
    marginTop: 10,
  },
  noResultsText: {
    fontSize: 16,
    color: "#718096",
    textAlign: "center",
  },
});
