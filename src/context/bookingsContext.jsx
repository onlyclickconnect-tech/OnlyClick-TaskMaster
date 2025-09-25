import React, { createContext, useContext, useState } from 'react';
import api from '../app/api/api';

const BookingsContext = createContext();

export const useBookings = () => {
  const context = useContext(BookingsContext);
  if (!context) {
    throw new Error('useBookings must be used within a BookingsProvider');
  }
  return context;
};

export const BookingsProvider = ({ children }) => {
  const [inProgressBookings, setInProgressBookings] = useState([]);
  const [completedBookings, setCompletedBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch in-progress bookings
  const fetchInProgressBookings = async () => {
    try {
      const { data, errors } = await api.post('api/v1/getJobsInProgress');
      if (errors) throw errors;
      const bookings = data?.data || [];
      setInProgressBookings(bookings);
      return bookings;
    } catch (error) {
      console.error('Error fetching in-progress bookings:', error);
      return [];
    }
  };

  // Fetch completed bookings
  const fetchCompletedBookings = async () => {
    try {
      const { data, errors } = await api.post('api/v1/getJobsCompleted');
      if (errors) throw errors;
      const bookings = data?.data || [];
      setCompletedBookings(bookings);
      return bookings;
    } catch (error) {
      console.error('Error fetching completed bookings:', error);
      return [];
    }
  };

  // Refresh all bookings (only in-progress and completed)
  const refreshAllBookings = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchInProgressBookings(), fetchCompletedBookings()]);
    } catch (error) {
      console.error('Error refreshing bookings:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Add booking to in-progress
  const addToInProgress = (booking) => {
    setInProgressBookings(prev => [booking, ...prev]);
  };

  // Move booking to completed
  const moveToCompleted = (booking) => {
    setInProgressBookings(prev => prev.filter(b => b._id !== booking._id));
    setCompletedBookings(prev => [{ ...booking, status: 'completed' }, ...prev]);
  };

  // Update in-progress booking
  const updateInProgressBooking = (bookingId, updates) => {
    setInProgressBookings(prev =>
      prev.map(booking =>
        booking._id === bookingId ? { ...booking, ...updates } : booking
      )
    );
  };

  // Remove from in-progress
  const removeInProgressBooking = (bookingId) => {
    setInProgressBookings(prev => prev.filter(booking => booking._id !== bookingId));
  };

  // Get booking by ID
  const getBookingById = (bookingId) => {
    return [...inProgressBookings, ...completedBookings].find(booking => booking._id === bookingId);
  };

  // Get total counts
  const getCounts = () => ({
    inProgress: inProgressBookings.length,
    completed: completedBookings.length,
    total: inProgressBookings.length + completedBookings.length
  });

  const value = {
    // State
    inProgressBookings,
    completedBookings,
    loading,
    refreshing,

    // Actions
    fetchInProgressBookings,
    fetchCompletedBookings,
    refreshAllBookings,
    addToInProgress,
    moveToCompleted,
    updateInProgressBooking,
    removeInProgressBooking,
    getBookingById,
    getCounts,

    // Setters (for direct state updates if needed)
    setInProgressBookings,
    setCompletedBookings,
    setLoading,
  };

  return (
    <BookingsContext.Provider value={value}>
      {children}
    </BookingsContext.Provider>
  );
};