import { StyleSheet, View, Text, TouchableOpacity, FlatList, ScrollView, Image, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function TimeTableScreen() {
   
    const [selectedClassroom, setSelectedClassroom] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [timetable, setTimetable] = useState([]);
  
    const classrooms = ["AL001", "AL004", "AL101", "AL201", "AL202", "AL207"];
  
    useEffect(() => {
      if (selectedClassroom) {
        fetchTimetable(selectedClassroom);
      }
    }, [selectedClassroom]);
  
    const fetchTimetable = async (classroomId) => {
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
        onPress={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <Text style={styles.dropdownButtonText}>
          {selectedClassroom ? selectedClassroom : 'Select a Classroom'}
        </Text>
      </TouchableOpacity>

      {isDropdownOpen && (
        <View style={styles.dropdownContainer}>
          {classrooms.map((room, index) => (
            <TouchableOpacity
              key={index}
              style={styles.slotItem}
              onPress={() => {
                setSelectedClassroom(room);
                setIsDropdownOpen(false);
              }}
            >
              <Text style={styles.slotText}>{room}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView horizontal={true} style={styles.TimeTableContainer}>
        <View style={styles.timetableContent}>
          <Text style={styles.TimeTableText}>Time Table:</Text>
          <FlatList
            data={timetable}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Text style={styles.timetableText}>{item}</Text>
            )}
          />
        </View>
      </ScrollView>
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
  
});
