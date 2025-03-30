import React, { createContext, useState, useEffect, ReactNode } from "react";

interface FetchDContextType {
  freeSlots: Slot[];
  filteredSlots: Slot[];
  bookedSlots: Slot[];
  filteredBookedSlots: Slot[];
  setSelectedDay: (day: string) => void;
  setSelectedClassroom: (classroom: string) => void;
  setSelectedTimeSlot: (timeSlot: string) => void;
  freeBatchSlots: Slot[];
  filteredBatchSlots: Slot[];
  setSelectedBatch: (batch: string) => void;
}

export const FetchD = createContext<FetchDContextType | null>(null);

export interface Slot {
  batch_id?: string;
  classroom_id?: string;
  day: string;
  start_time: string;
  end_time: string;
  id?: string;
  subject_id?: string;
  teacher_id?: string;
}

export const FetchDProvider = ({ children }: { children: ReactNode }) => {
  const [freeSlots, setFreeSlots] = useState<Slot[]>([]);
  const [filteredSlots, setFilteredSlots] = useState<Slot[]>([]);
  const [bookedSlots, setBookedSlots] = useState<Slot[]>([]);
  const [filteredBookedSlots, setFilteredBookedSlots] = useState<Slot[]>([]);
  const [freeBatchSlots, setFreeBatchSlots] = useState<Slot[]>([]);
  const [filteredBatchSlots, setFilteredBatchSlots] = useState<Slot[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>("All");
  const [selectedClassroom, setSelectedClassroom] = useState<string>("All");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("All");
  const [selectedBatch, setSelectedBatch] = useState<string>("All");

  useEffect(() => {
    fetch("http://192.168.0.210:5000/Batches")
      .then((response) => response.json())
      .then((data: Slot[]) => {
        setFreeBatchSlots(data);
        setFilteredBatchSlots(data);
      })
      .catch((error) => console.error("Error fetching batch slots:", error));
  }, []);

  useEffect(() => {
    fetch("http://192.168.0.210:5000/Classroom")
      .then((response) => response.json())
      .then((data: Slot[]) => {
        setFreeSlots(data);
        setFilteredSlots(data);
      })
      .catch((error) => console.error("Error fetching free slots:", error));
  }, []);

  useEffect(() => {
    fetch("http://192.168.0.210:5000/allTimeSlots")
      .then((response) => response.json())
      .then((data: Slot[]) => {
        setBookedSlots(data);
        setFilteredBookedSlots(data);
      })
      .catch((error) => console.error("Error fetching booked slots:", error));
  }, []);

  const isWithinTimeSlot = (slot: Slot, timeSlot: string) => {
    if (timeSlot === "All") return true;
    const [start, end] = timeSlot.split("-");
    return slot.start_time <= start && slot.end_time >= end;
  };

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

  useEffect(() => {
    let filtered = bookedSlots;
    if (selectedDay !== "All") {
      filtered = filtered.filter((slot) => slot.day === selectedDay);
    }
    if (selectedClassroom !== "All") {
      filtered = filtered.filter(
        (slot) => slot.classroom_id === selectedClassroom
      );
    }
    if (selectedBatch !== "All") {
      filtered = filtered.filter((slot) => slot.batch_id === selectedBatch);
    }
    setFilteredBookedSlots(filtered);
  }, [selectedDay, selectedClassroom, selectedBatch, bookedSlots]);

  return (
    <FetchD.Provider
      value={{
        freeSlots,
        filteredSlots,
        bookedSlots,
        filteredBookedSlots,
        setSelectedDay,
        setSelectedClassroom,
        setSelectedTimeSlot,
        freeBatchSlots,
        filteredBatchSlots,
        setSelectedBatch,
      }}
    >
      {children}
    </FetchD.Provider>
  );
};
