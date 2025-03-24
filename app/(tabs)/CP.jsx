import { StyleSheet, View, Text, TouchableOpacity, Image, Platform } from 'react-native';
import React, { useState } from 'react';
import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function TabTwoScreen() {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const timeSlots = [
    "8:30-9:30", "9:30-10:30", "10:30-11:30", "11:30-12:30", 
    "12:30-1:30", "1:30-2:30", "2:30-3:30", "3:30-4:30", 
    "4:30-5:30", "5:30-6:30"
  ];

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Classroom Picker</ThemedText>
      {/* <Text style={styles.text}> Select the time slot: </Text> */}
      
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <Text style={styles.dropdownButtonText}>
          {selectedSlot ? selectedSlot : 'Select a time slot'}
        </Text>
      </TouchableOpacity>

      {isDropdownOpen && (
        <View style={styles.dropdownContainer}>
          {timeSlots.map((slot, index) => (
            <TouchableOpacity
              key={index}
              style={styles.slotItem}
              onPress={() => {
                setSelectedSlot(slot);
                setIsDropdownOpen(false);
              }}
            >
              <Text style={styles.slotText}>{slot}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <View style={styles.availableClassrooms}>
        <Text style={styles.availableClassroomsText}>
          Available Classrooms:
        </Text>
      </View>
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
    fontSize : 30,
    marginBottom : 10, 
    fontStyle : 'italic',
    color : "#59788E",
    textAlign : 'center',
  },
  text : {
    fontSize : 15,
    color : "#59788E",
    padding : 15,
    textAlign : 'left',
  },
  dropdownButton: {
    width: '100%',
    marginLeft: 'auto',
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
  availableClassrooms: {
    marginTop: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    height: 550,
  },
  availableClassroomsText: {
    fontSize: 20,
    color: '#59788E',
    textAlign: 'center',
  },
  
});

