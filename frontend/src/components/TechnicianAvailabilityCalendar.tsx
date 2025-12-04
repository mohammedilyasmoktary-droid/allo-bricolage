import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { bookingsApi, Booking } from '../api/bookings';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import { format, addDays, isSameDay, isBefore, startOfDay, parseISO } from 'date-fns';

interface TechnicianAvailabilityCalendarProps {
  technicianId: string;
  selectedDateTime: string;
  onDateTimeSelect: (dateTime: string) => void;
}

const TechnicianAvailabilityCalendar: React.FC<TechnicianAvailabilityCalendarProps> = ({
  technicianId,
  selectedDateTime,
  onDateTimeSelect,
}) => {
  const [unavailableBookings, setUnavailableBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Generate next 30 days
  const generateDays = () => {
    const days = [];
    const today = startOfDay(new Date());
    for (let i = 0; i < 30; i++) {
      days.push(addDays(today, i));
    }
    return days;
  };

  const days = generateDays();

  // Generate time slots (8 AM to 8 PM, every hour)
  const timeSlots = Array.from({ length: 13 }, (_, i) => {
    const hour = 8 + i;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  useEffect(() => {
    const loadUnavailableDates = async () => {
      if (!technicianId) return;
      
      setLoading(true);
      try {
        // Get all bookings and filter for this technician's unavailable times
        // Only include bookings with scheduledDateTime that are not cancelled/declined
        const allBookings = await bookingsApi.getAll();
        const technicianBookings = allBookings.filter(
          (booking) =>
            booking.technicianId === technicianId &&
            booking.scheduledDateTime &&
            booking.status !== 'CANCELLED' &&
            booking.status !== 'DECLINED'
        );
        setUnavailableBookings(technicianBookings);
      } catch (error) {
        console.error('Failed to load unavailable dates:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUnavailableDates();
  }, [technicianId]);

  // Check if a date has unavailable bookings
  const isDateUnavailable = (date: Date): boolean => {
    return unavailableBookings.some((booking) => {
      if (!booking.scheduledDateTime) return false;
      const bookingDate = parseISO(booking.scheduledDateTime);
      return isSameDay(bookingDate, date);
    });
  };

  // Get unavailable times for selected date
  const getUnavailableTimes = (date: Date): string[] => {
    return unavailableBookings
      .filter((booking) => {
        if (!booking.scheduledDateTime) return false;
        const bookingDate = parseISO(booking.scheduledDateTime);
        return isSameDay(bookingDate, date);
      })
      .map((booking) => {
        if (!booking.scheduledDateTime) return '';
        const bookingDate = parseISO(booking.scheduledDateTime);
        return format(bookingDate, 'HH:mm');
      });
  };

  // Check if a time slot is unavailable
  const isTimeUnavailable = (time: string): boolean => {
    if (!selectedDate) return false;
    const unavailableTimes = getUnavailableTimes(selectedDate);
    return unavailableTimes.includes(time);
  };

  const handleDateSelect = (date: Date) => {
    if (isBefore(date, startOfDay(new Date()))) return;
    if (isDateUnavailable(date)) return;
    
    setSelectedDate(date);
    setSelectedTime('');
    onDateTimeSelect('');
  };

  const handleTimeSelect = (time: string) => {
    if (!selectedDate || isTimeUnavailable(time)) return;
    
    setSelectedTime(time);
    const [hours, minutes] = time.split(':');
    const dateTime = new Date(selectedDate);
    dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    onDateTimeSelect(dateTime.toISOString());
  };

  // Initialize selected date from selectedDateTime
  useEffect(() => {
    if (selectedDateTime) {
      const dt = parseISO(selectedDateTime);
      setSelectedDate(dt);
      setSelectedTime(format(dt, 'HH:mm'));
    }
  }, [selectedDateTime]);

  return (
    <Card
      sx={{
        boxShadow: 3,
        borderRadius: 3,
        border: '1px solid #e0e0e0',
        height: '100%',
        position: 'sticky',
        top: 20,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <CalendarTodayIcon sx={{ color: '#F4C542', fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#032B5A' }}>
            Choisir la date et l'heure
          </Typography>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress sx={{ color: '#F4C542' }} />
          </Box>
        ) : (
          <>
            {/* Date Selection */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#032B5A' }}>
                Sélectionnez une date
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: 1,
                  maxHeight: 300,
                  overflowY: 'auto',
                  p: 1,
                  bgcolor: '#f8f9fa',
                  borderRadius: 2,
                }}
              >
                {days.map((day, index) => {
                  const isUnavailable = isDateUnavailable(day);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isPast = isBefore(day, startOfDay(new Date()));
                  const isToday = isSameDay(day, new Date());

                  return (
                    <Button
                      key={index}
                      onClick={() => handleDateSelect(day)}
                      disabled={isUnavailable || isPast}
                      sx={{
                        minWidth: 40,
                        height: 50,
                        p: 0,
                        borderRadius: 2,
                        bgcolor: isSelected
                          ? '#F4C542'
                          : isUnavailable
                          ? '#ffebee'
                          : isPast
                          ? '#f5f5f5'
                          : 'white',
                        color: isSelected
                          ? '#032B5A'
                          : isUnavailable
                          ? '#d32f2f'
                          : isPast
                          ? '#9e9e9e'
                          : '#032B5A',
                        border: isSelected
                          ? '2px solid #F4C542'
                          : isUnavailable
                          ? '2px solid #d32f2f'
                          : '1px solid #e0e0e0',
                        '&:hover': {
                          bgcolor: isUnavailable || isPast
                            ? undefined
                            : isSelected
                            ? '#e0b038'
                            : 'rgba(244, 197, 66, 0.1)',
                        },
                        '&:disabled': {
                          color: isUnavailable ? '#d32f2f' : '#9e9e9e',
                        },
                        fontSize: '0.75rem',
                        fontWeight: isSelected || isToday ? 700 : 500,
                      }}
                    >
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ display: 'block', fontSize: '0.65rem' }}>
                          {format(day, 'EEE')}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                          {format(day, 'd')}
                        </Typography>
                      </Box>
                    </Button>
                  );
                })}
              </Box>
            </Box>

            {/* Time Selection */}
            {selectedDate && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#032B5A' }}>
                  Sélectionnez une heure
                </Typography>
                {isDateUnavailable(selectedDate) ? (
                  <Alert severity="warning" sx={{ borderRadius: 2 }}>
                    Cette date n'est pas disponible
                  </Alert>
                ) : (
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 1,
                      maxHeight: 200,
                      overflowY: 'auto',
                      p: 1,
                      bgcolor: '#f8f9fa',
                      borderRadius: 2,
                    }}
                  >
                    {timeSlots.map((time) => {
                      const isUnavailable = isTimeUnavailable(time);
                      const isSelected = selectedTime === time;

                      return (
                        <Button
                          key={time}
                          onClick={() => handleTimeSelect(time)}
                          disabled={isUnavailable}
                          startIcon={<AccessTimeIcon sx={{ fontSize: 16 }} />}
                          sx={{
                            borderRadius: 2,
                            bgcolor: isSelected ? '#F4C542' : isUnavailable ? '#ffebee' : 'white',
                            color: isSelected
                              ? '#032B5A'
                              : isUnavailable
                              ? '#d32f2f'
                              : '#032B5A',
                            border: isSelected
                              ? '2px solid #F4C542'
                              : isUnavailable
                              ? '2px solid #d32f2f'
                              : '1px solid #e0e0e0',
                            '&:hover': {
                              bgcolor: isUnavailable
                                ? undefined
                                : isSelected
                                ? '#e0b038'
                                : 'rgba(244, 197, 66, 0.1)',
                            },
                            '&:disabled': {
                              color: '#d32f2f',
                            },
                            fontSize: '0.85rem',
                            fontWeight: isSelected ? 700 : 500,
                            textTransform: 'none',
                          }}
                        >
                          {time}
                        </Button>
                      );
                    })}
                  </Box>
                )}
              </Box>
            )}

            {/* Legend */}
            <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #e0e0e0' }}>
              <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block', color: '#032B5A' }}>
                Légende:
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: 1,
                      bgcolor: '#F4C542',
                      border: '1px solid #e0e0e0',
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Disponible
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: 1,
                      bgcolor: '#ffebee',
                      border: '2px solid #d32f2f',
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Indisponible
                  </Typography>
                </Box>
              </Box>
            </Box>

            {selectedDate && selectedTime && (
              <Alert severity="success" sx={{ mt: 2, borderRadius: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Date sélectionnée: {format(selectedDate, 'EEEE d MMMM yyyy')} à {selectedTime}
                </Typography>
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TechnicianAvailabilityCalendar;

