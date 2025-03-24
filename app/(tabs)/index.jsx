import { Image, StyleSheet, Platform, Pressable } from 'react-native';
import { View, Text } from 'react-native';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import {Link} from 'expo-router'
import React from 'react';

export default function HomeScreen() {
  return (
      <ThemedView style={styles.container}>
        <Link href='/CP' style = {{marginHorizontal: 'auto'}} asChild>
          <Pressable style = {styles.button}>
            <ThemedText style = {styles.buttonText}>
              Classroom Picker
            </ThemedText>
          </Pressable>
        </Link>

        <Link href='/TT' style = {{marginHorizontal: 'auto'}} asChild>
          <Pressable style = {styles.button}>
            <ThemedText style = {styles.buttonText}>
              Time Table
            </ThemedText>
          </Pressable>
        </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
    backgroundColor : "lightblue",
  },

  button :{
    height : 255,
    width : '85%',
    borderRadius : 8,
    backgroundColor : 'rgba(42,150,167,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding : 6,
  },
  buttonText : {
    fontSize : 25,
    color : 'white',
    textAlign : 'center',
  }
});
