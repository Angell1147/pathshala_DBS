import React, { createContext, useState, useEffect, ReactNode } from "react";

interface FetchDContextType {
  freeSlots: Slot[];
  filteredSlots: Slot[];
  setSelectedDay: (day: string) => void;
  setSelectedClassroom: (classroom: string) => void;
  setSelectedTimeSlot: (timeSlot: string) => void;
}

export const FetchD = createContext<FetchDContextType | null>(null);
// types.ts
export interface Slot {
  classroom_id: string;
  day: string;
  free_start: string;
  free_end: string;
}

export const FetchDProvider = ({ children }: { children: ReactNode }) => {
  const [freeSlots, setFreeSlots] = useState<Slot[]>([]);
  const [filteredSlots, setFilteredSlots] = useState<Slot[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>("All");
  const [selectedClassroom, setSelectedClassroom] = useState<string>("All");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("All");

  useEffect(() => {
    fetch("http://127.0.0.1:5000/freeTimeSlots")
      .then((response) => response.json())
      .then((data: Slot[]) => {
        setFreeSlots(data);
        setFilteredSlots(data);
      })
      .catch((error) => console.error("Error fetching free slots:", error));
  }, []);

  // Helper function to check if a slot falls within the selected time slot
  const isWithinTimeSlot = (slot: Slot, timeSlot: string) => {
    if (timeSlot === "All") return true;
    const [start, end] = timeSlot.split("-"); // Example: "8:30-9:30"
    return slot.free_start <= start && slot.free_end >= end ;
  };

  // Apply filters
  useEffect(() => {
    let filtered = freeSlots;

    if (selectedDay !== "All") {
      filtered = filtered.filter((slot) => slot.day === selectedDay);
    }

    if (selectedClassroom !== "All") {
      filtered = filtered.filter(
        (slot) => slot.classroom_id === selectedClassroom
      );
    }

    if (selectedTimeSlot !== "All") {
      filtered = filtered.filter((slot) =>
        isWithinTimeSlot(slot, selectedTimeSlot)
      );
    }

    setFilteredSlots(filtered);
  }, [selectedDay, selectedClassroom, selectedTimeSlot, freeSlots]);

  return (
    <FetchD.Provider
      value={{
        freeSlots,
        filteredSlots,
        setSelectedDay,
        setSelectedClassroom,
        setSelectedTimeSlot,
      }}
    >
      {children}
    </FetchD.Provider>
  );
};
