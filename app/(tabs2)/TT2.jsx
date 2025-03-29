import { StyleSheet, View, Text, TouchableOpacity, FlatList, ScrollView, Modal, TextInput, Button, Image, Platform } from 'react-native';
import React, { useContext, useState, useEffect } from 'react';
import {FetchD} from '@/context/FetchD';
import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function TimeTableScreen() {
    const fetchDContext = useContext(FetchD);

    if (!fetchDContext) {
      return <Text>Loading...</Text>;
    }
  
    const { filteredSlots } = fetchDContext;
    const [selectedClassroom, setSelectedClassroom] = useState(null);
    const [isClassroomDropdownOpen, setIsCLassroomDropdownOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [isBatchDropdownOpen, setIsBatchDropdownOpen] = useState(false);
    const [timetable, setTimetable] = useState([]);
  
    const classrooms = ["AL001", "AL004", "AL101", "AL201", "AL202", "AL207"];
    const batches = ["FYIT", "FYCS", "SYIT", "SYCS", "TYIT", "TYCS", "LYIT","LYCS", "MCA"];
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
      "17:30 - 18:30"
    ];
    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [batchID, setBatchID] = useState("");

    // Open Modal with Selected Slot Info
    const openModal = (day, slot) => {
        const [start_time, end_time] = slot.split(" - ");
        setSelectedSlot({ day, start_time, end_time });
        setModalVisible(true);
    };

    // Handle Scheduling
    const handleSchedule = () => {
        if (!batchID.trim()) return;

        const requestData = {
        day: selectedSlot.day,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        batchID,
        };

        console.log("Sending to backend:", requestData); // Replace with actual API call
        setModalVisible(false);
        setBatchID(""); // Reset batch input
    };

    useEffect(() => {
      if (selectedClassroom && selectedBatch) {
        fetchTimetable(selectedClassroom, selectedBatch);
      }
    }, [selectedClassroom, selectedBatch]);
  
    const fetchTimetable = async (classroomId, battchID) => {
      try {
        const response = await fetch(`https://your-backend-url.com/api/timetable?classroom=${classroomId}`);
        const data = await response.json();
        setTimetable(data.timetable);
      } catch (error) {
        console.error("Error fetching timetable:", error);
      }
    };
  
  return (
    <View style={styles.container}>
        <ThemedText style={styles.title}>Time Table</ThemedText>
        <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => {
          setIsCLassroomDropdownOpen(!isClassroomDropdownOpen);
          setIsBatchDropdownOpen(false);
        }}
      >
        <Text style={styles.dropdownButtonText}>
          {selectedClassroom ? selectedClassroom : 'Select a Classroom'}
        </Text>
      </TouchableOpacity>

      {isClassroomDropdownOpen && (
        <View style={styles.dropdownContainer}>
          {classrooms.map((room, index) => (
            <TouchableOpacity
              key={index}
              style={styles.slotItem}
              onPress={() => {
                setSelectedClassroom(room);
                setIsCLassroomDropdownOpen(false);
              }}
            >
              <Text style={styles.slotText}>{room}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => {
          setIsBatchDropdownOpen(!isBatchDropdownOpen);
          setIsCLassroomDropdownOpen(false);
        }}
      >
        <Text style={styles.dropdownButtonText}>
          {selectedClassroom ? selectedClassroom : 'Select a Batch'}
        </Text>
      </TouchableOpacity>

      {isBatchDropdownOpen && (
        <View style={styles.dropdownContainer}>
          {batches.map((batch, index) => (
            <TouchableOpacity
              key={index}
              style={styles.slotItem}
              onPress={() => {
                setSelectedBatch(batch);
                setIsBatchDropdownOpen(false);
              }}
            >
              <Text style={styles.slotText}>{batch}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

    <ScrollView horizontal>
        <View style={styles.grid}>
          {/* Header Row */}
          <View style={styles.gridRow}>
            <Text style={styles.headerCell}>Time</Text>
            {days.map((day, index) => (
              <Text key={index} style={styles.headerCell}>{day}</Text>
            ))}
          </View>

          {/* Time Slots & Data */}
          {timeSlots.map((slot, rowIndex) => (
            <View key={rowIndex} style={styles.gridRow}>
              <Text style={styles.timeSlotCell}>{slot}</Text>
              {days.map((day, colIndex) => {
                const entry = filteredSlots.find(
                  item => item.day === day && item.start_time === slot.split(" - ")[0]
                );

                return (
                  <TouchableOpacity 
                    key={colIndex} 
                    style={styles.gridCell}
                    onPress={() => openModal(day, slot)}>
                    {entry ? (
                      <>
                        <Text style={styles.subjectText}>{entry.subject_id}</Text>
                        <Text style={styles.teacherText}>{entry.teacher_id}</Text>
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

      {/* Modal for Scheduling */}
      <Modal 
        transparent={true} 
        visible={modalVisible} 
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
    >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Schedule a Batch</Text>
            <Text>Day: {selectedSlot?.day}</Text>
            <Text>Time: {selectedSlot?.start_time} - {selectedSlot?.end_time}</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter Batch ID"
              value={batchID}
              onChangeText={setBatchID}
            />
            <Button title="Schedule" onPress={handleSchedule} />
            <Button title="Cancel" color="red" padding='10' onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>

    
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#DCEDF0',
  },
  title : {
    fontSize : 25,
    color : "#59788E",
    textAlign : 'center',
  },
  dropdownButton: {
    width: '100%',
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    backgroundColor: 'white',
    padding: 10,
    alignItems: 'center',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: 'black',
  },
  dropdownContainer: {
    marginTop: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'gray',
  },
  slotItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'lightgray',
  },
  slotText: {
    fontSize: 16,
    textAlign: 'center',
  },
  TimeTableContainer: {
    marginTop: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    height: 550,
  },
  timetableContent: {
    flexDirection: 'row',  
  },
  TimeTableText: {
    fontSize: 20,
    color: '#59788E',
    textAlign: 'center',
  },
  timetableText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 5,
  },
    grid: {
      padding : 10,
      borderWidth: 1,
      borderColor: "#DCEDF0",
    },
    gridRow: {
      flexDirection: "row",
    },
    headerCell: {
      width: 100,
      padding: 10,
      backgroundColor: "#ddd",
      textAlign: "center",
      fontWeight: "itallic",
      borderWidth: 1,
      borderColor: "#ccc",
    },
    timeSlotCell: {
      width: 100,
      padding: 10,
      textAlign: "center",
      fontWeight: "itallic",
      borderWidth: 1,
      borderColor: "#ccc",
    },
    gridCell: {
      width: 100,
      height: 55,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#ccc",
    },
    subjectText: {
      fontWeight: "bold",
    },
    teacherText: {
      fontSize: 12,
      color: "gray",
    },
    emptyCell: {
      height: "100%",
      width: "100%",
    },
    modalOverlay: { 
        flex: 1, 
        justifyContent: "center", 
        alignItems: "center", 
        backgroundColor: "rgba(0,0,0,0.5)" 
    },
    modalContent: { 
        backgroundColor: "white", 
        padding: 20, 
        borderRadius: 10, 
        width: "80%", 
        alignItems: "center" 
    },
    modalTitle: { 
        fontSize: 18, 
        fontWeight: "bold", 
        marginBottom: 10 
    },
    input: { 
        width: "100%", 
        borderWidth: 1, 
        padding: 10, 
        marginVertical: 10, 
        borderRadius: 5 
    },
  });
  