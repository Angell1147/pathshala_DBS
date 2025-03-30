// context for fetching data from the server
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
  teacher_id?: string;
  subject_id?: string;
}
export interface Slot2 {
  batch_id: string;
  classroom_id: string;
  day: string;
  start_time: string;
  end_time: string;
  id: string;
  teacher_id: string;
  subject_id: string;
}

export const FetchDProvider = ({ children }: { children: ReactNode }) => {
  const [freeSlots, setFreeSlots] = useState<Slot[]>([]);
  const [filteredSlots, setFilteredSlots] = useState<Slot[]>([]);
  const [bookedSlots, setBookedSlots] = useState<Slot2[]>([]);
  const [filteredBookedSlots, setFilteredBookedSlots] = useState<Slot2[]>([]);
  const [freeBatchSlots, setFreeBatchSlots] = useState<Slot[]>([]);
  const [filteredBatchSlots, setFilteredBatchSlots] = useState<Slot[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>("All");
  const [selectedClassroom, setSelectedClassroom] = useState<string>("All");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("All");
  const [selectedBatch, setSelectedBatch] = useState<string>("All");

  useEffect(() => {
    fetch("http://127.0.0.1:5000/Batches")
      .then((response) => response.json())
      .then((data: Slot[]) => {
        setFreeBatchSlots(data);
        setFilteredBatchSlots(data);
      })
      .catch((error) => console.error("Error fetching batch slots:", error));
  }, []);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/Classroom")
      .then((response) => response.json())
      .then((data: Slot[]) => {
        setFreeSlots(data);
        setFilteredSlots(data);
      })
      .catch((error) => console.error("Error fetching free slots:", error));
  }, []);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/allTimeSlots")
      .then((response) => response.json())
      .then((data: Slot[]) => {
        // console.log("Fetched booked slots:", data);
        setBookedSlots(
          data.map((slot) => ({
            ...slot,
            batch_id: slot.batch_id || "",
            classroom_id: slot.classroom_id || "",
            id: slot.id || "",
            teacher_id: slot.teacher_id || "",
            subject_id: slot.subject_id || "",
          }))
        );
        setFilteredBookedSlots(
          data.map((slot) => ({
            ...slot,
            batch_id: slot.batch_id || "",
            classroom_id: slot.classroom_id || "",
            id: slot.id || "",
            teacher_id: slot.teacher_id || "",
            subject_id: slot.subject_id || "",
          }))
        );
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
