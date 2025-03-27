import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
} from "react-native";
import React, { useContext, useState } from "react";
import { FetchD } from "@/context/FetchD";

export default function TabTwoScreen() {
  const fetchDContext = useContext(FetchD);

  if (!fetchDContext) {
    return <Text>Loading...</Text>;
  }

  const { filteredSlots, setSelectedDay, setSelectedClassroom } = fetchDContext;
  const [selectedClassroom, setSelectedClassroomLocal] = useState("All");
  const [selectedDay, setSelectedDayLocal] = useState("All");
  const [isClassroomDropdownOpen, setIsClassroomDropdownOpen] = useState(false);
  const [isDayDropdownOpen, setIsDayDropdownOpen] = useState(false);

  const days = ["All", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const classrooms = [
    "All",
    ...new Set(filteredSlots.map((slot, index) => slot.classroom_id)),
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Classroom Picker</Text>

      {/* Filter Dropdowns */}
      <View style={styles.dropdownRow}>
        {/* Filter by Classroom Dropdown */}
        <View style={styles.dropdownWrapper}>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setIsClassroomDropdownOpen(!isClassroomDropdownOpen)}
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

        {/* Filter by Day Dropdown */}
        <View style={styles.dropdownWrapper}>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setIsDayDropdownOpen(!isDayDropdownOpen)}
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
      <Text style={styles.availableClassroomsText}>Available Classrooms:</Text>
      <FlatList
        data={filteredSlots}
        keyExtractor={(item, index) =>
          `${item.classroom_id}-${item.free_start}-${index}`
        }
        renderItem={({ item }) => (
          <View style={styles.classroomCard}>
            <Text style={styles.cardText}>
              Classroom ID: {item.classroom_id}
            </Text>
            <Text style={styles.cardText}>Day: {item.day}</Text>
            <Text style={styles.cardText}>Start: {item.free_start}</Text>
            <Text style={styles.cardText}>End: {item.free_end}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#DCEDF0" },
  title: {
    fontSize: 30,
    marginBottom: 10,
    fontStyle: "italic",
    color: "#59788E",
    textAlign: "center",
  },
  dropdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  dropdownWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  dropdownButton: {
    width: "100%",
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 8,
    backgroundColor: "white",
    padding: 10,
    alignItems: "center",
  },
  dropdownButtonText: { fontSize: 16, color: "black" },
  dropdownContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "gray",
    marginTop: 5,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "lightgray",
  },
  dropdownItemText: { fontSize: 16, textAlign: "center" },
  availableClassroomsText: {
    fontSize: 20,
    color: "#59788E",
    textAlign: "center",
    marginBottom: 10,
  },
  classroomCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  cardText: { fontSize: 16, color: "black" },
});
