import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Switch,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import React, { useContext, useState, useEffect } from "react";
import { FetchD } from "@/context/FetchD";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link } from "expo-router";

export default function ClassroomPickerScreen() {
  const { width } = Dimensions.get("window");
  const router = useRouter();
  const fetchDContext = useContext(FetchD);
  const [sessionVerified, setSessionVerified] = useState(true);

  // View state
  const [viewMode, setViewMode] = useState("classroom");
  const [classrooms, setClassrooms] = useState([]);
  const [batches, setBatches] = useState([]);
  const [timeSlots] = useState([
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

  // Session verification

  // Logout function

  // Extract unique classrooms and batches
  useEffect(() => {
    if (fetchDContext?.freeSlots) {
      const uniqueClassrooms = [
        ...new Set(fetchDContext.freeSlots.map((s) => s.classroom_name)),
      ];
      setClassrooms(uniqueClassrooms);
      if (uniqueClassrooms.length > 0 && !selectedClassroom) {
        setSelectedClassroomLocal(uniqueClassrooms[0]);
      }
    }

    if (fetchDContext?.freeBatchSlots) {
      const uniqueBatches = [
        ...new Set(fetchDContext.freeBatchSlots.map((s) => s.batch_name)),
      ];
      setBatches(uniqueBatches);
      if (uniqueBatches.length > 0 && !selectedBatch) {
        setSelectedBatchLocal(uniqueBatches[0]);
      }
    }
  }, [fetchDContext?.freeSlots, fetchDContext?.freeBatchSlots]);

  // Filter results
  useEffect(() => {
    let results = [];
    const source =
      viewMode === "classroom"
        ? fetchDContext?.freeSlots
        : fetchDContext?.freeBatchSlots;

    if (source) {
      results = source.filter((slot) => {
        const classroomMatch =
          viewMode !== "classroom" ||
          selectedClassroom === "" ||
          slot.classroom_name === selectedClassroom;
        const batchMatch =
          viewMode !== "batch" ||
          selectedBatch === "" ||
          slot.batch_name === selectedBatch;
        const dayMatch = selectedDay === "All" || slot.day === selectedDay;
        const timeMatch =
          selectedTimeSlot === "All" ||
          (slot.free_start.substring(0, 5) <=
            selectedTimeSlot.split(" - ")[0] &&
            slot.free_end.substring(0, 5) >= selectedTimeSlot.split(" - ")[1]);

        return classroomMatch && batchMatch && dayMatch && timeMatch;
      });
    }

    setFilteredResults(results || []);
  }, [
    viewMode,
    selectedClassroom,
    selectedBatch,
    selectedDay,
    selectedTimeSlot,
    fetchDContext,
  ]);

  if (!fetchDContext) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Helper functions
  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "classroom" ? "batch" : "classroom"));
    setIsClassroomDropdownOpen(false);
    setIsBatchDropdownOpen(false);
    setIsDayDropdownOpen(false);
    setIsTimeSlotDropdownOpen(false);
  };

  const openDropdown = (dropdown) => {
    setIsClassroomDropdownOpen(dropdown === "classroom");
    setIsBatchDropdownOpen(dropdown === "batch");
    setIsDayDropdownOpen(dropdown === "day");
    setIsTimeSlotDropdownOpen(dropdown === "timeSlot");
  };

  const handleSelect = (type, value) => {
    const setters = {
      classroom: [
        setSelectedClassroomLocal,
        fetchDContext.setSelectedClassroom,
      ],
      batch: [setSelectedBatchLocal, fetchDContext.setSelectedBatch],
      day: [setSelectedDayLocal, fetchDContext.setSelectedDay],
      timeSlot: [setSelectedTimeSlotLocal, fetchDContext.setSelectedTimeSlot],
    };

    setters[type][0](value);
    if (setters[type][1]) setters[type][1](value);
    setIsClassroomDropdownOpen(false);
    setIsBatchDropdownOpen(false);
    setIsDayDropdownOpen(false);
    setIsTimeSlotDropdownOpen(false);
  };

  return (
    <View style={styles.mainContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Classroom Picker</Text>
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
        {/* View Mode Toggle */}
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

        {/* Filters */}
        <View style={styles.filtersContainer}>
          {/* Classroom/Batch Dropdown */}
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() =>
              openDropdown(viewMode === "classroom" ? "classroom" : "batch")
            }
          >
            <Text style={styles.dropdownButtonText}>
              {viewMode === "classroom"
                ? selectedClassroom || "Select Classroom"
                : selectedBatch || "Select Batch"}
            </Text>
          </TouchableOpacity>

          {/* Day Dropdown */}
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => openDropdown("day")}
          >
            <Text style={styles.dropdownButtonText}>{selectedDay}</Text>
          </TouchableOpacity>

          {/* Time Slot Dropdown */}
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => openDropdown("timeSlot")}
          >
            <Text style={styles.dropdownButtonText}>{selectedTimeSlot}</Text>
          </TouchableOpacity>
        </View>

        {/* Dropdown Menus */}
        {isClassroomDropdownOpen && (
          <View style={styles.dropdownContainer}>
            <ScrollView style={styles.dropdownScroll}>
              {classrooms.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dropdownItem}
                  onPress={() => handleSelect("classroom", item)}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      selectedClassroom === item && styles.selectedItemText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {isBatchDropdownOpen && (
          <View style={styles.dropdownContainer}>
            <ScrollView style={styles.dropdownScroll}>
              {batches.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dropdownItem}
                  onPress={() => handleSelect("batch", item)}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      selectedBatch === item && styles.selectedItemText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {isDayDropdownOpen && (
          <View style={styles.dropdownContainer}>
            <ScrollView style={styles.dropdownScroll}>
              {days.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dropdownItem}
                  onPress={() => handleSelect("day", item)}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      selectedDay === item && styles.selectedItemText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {isTimeSlotDropdownOpen && (
          <View style={styles.dropdownContainer}>
            <ScrollView style={styles.dropdownScroll}>
              {timeSlots.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dropdownItem}
                  onPress={() => handleSelect("timeSlot", item)}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      selectedTimeSlot === item && styles.selectedItemText,
                    ]}
                  >
                    {item}
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
            scrollEnabled={false}
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
      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        <Link href="/" asChild>
          <Pressable style={styles.footerButton}>
            <Text style={styles.footerButtonText}>Home</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    fontSize: 18,
    color: "#59788E",
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
    maxHeight: 200,
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
