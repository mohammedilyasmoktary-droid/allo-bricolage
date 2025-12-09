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

  // Generate days organized by month (30 days per month)
  const generateDaysByMonth = () => {
    const daysByMonth: { month: string; year: number; days: Date[] }[] = [];
    const today = startOfDay(new Date());
    let currentDate = today;
    let currentMonth = format(currentDate, 'MMMM yyyy');
    let currentYear = currentDate.getFullYear();
    let daysInCurrentMonth: Date[] = [];
    let daysGenerated = 0;
    const totalDays = 60; // Generate 2 months worth (30 days each)

    while (daysGenerated < totalDays) {
      const monthKey = format(currentDate, 'MMMM yyyy');
      const year = currentDate.getFullYear();

      // If we've moved to a new month, save the previous month and start a new one
      if (monthKey !== currentMonth) {
        // Pad the previous month to 30 days if needed
        while (daysInCurrentMonth.length < 30 && daysGenerated < totalDays) {
          daysInCurrentMonth.push(addDays(daysInCurrentMonth[daysInCurrentMonth.length - 1] || currentDate, 1));
          daysGenerated++;
        }
        
        if (daysInCurrentMonth.length > 0) {
          daysByMonth.push({
            month: currentMonth,
            year: currentYear,
            days: daysInCurrentMonth.slice(0, 30), // Ensure exactly 30 days
          });
        }
        
        currentMonth = monthKey;
        currentYear = year;
        daysInCurrentMonth = [];
      }

      daysInCurrentMonth.push(currentDate);
      daysGenerated++;
      currentDate = addDays(currentDate, 1);
    }

    // Add the last month
    if (daysInCurrentMonth.length > 0) {
      // Pad to 30 days if needed
      while (daysInCurrentMonth.length < 30 && daysGenerated < totalDays) {
        daysInCurrentMonth.push(addDays(daysInCurrentMonth[daysInCurrentMonth.length - 1], 1));
        daysGenerated++;
      }
      daysByMonth.push({
        month: currentMonth,
        year: currentYear,
        days: daysInCurrentMonth.slice(0, 30), // Ensure exactly 30 days
      });
    }

    return daysByMonth;
  };

  const daysByMonth = generateDaysByMonth();
  const days = daysByMonth.flatMap(monthData => monthData.days);

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
        // Get bookings for this specific technician using query parameter
        // technicianId here is the technicianProfileId from the technician object
        // This will return up to 500 bookings for availability checking
        const allBookings = await bookingsApi.getAll(undefined, technicianId);
        
        // Filter for this technician's unavailable times
        // Include bookings with scheduledDateTime that are ACCEPTED or in progress (not cancelled/declined/completed)
        // When a technician accepts a booking, that date/time becomes unavailable
        const technicianBookings = allBookings.filter(
          (booking) =>
            (booking.technicianProfile?.id === technicianId || booking.technicianId === technicianId) &&
            booking.scheduledDateTime &&
            booking.status !== 'CANCELLED' &&
            booking.status !== 'DECLINED' &&
            booking.status !== 'COMPLETED' && // Exclude completed bookings from unavailable times
            (booking.status === 'ACCEPTED' || 
             booking.status === 'ON_THE_WAY' || 
             booking.status === 'IN_PROGRESS' || 
             booking.status === 'AWAITING_PAYMENT' ||
             booking.status === 'PENDING') && // Include PENDING and ACCEPTED as unavailable
            new Date(booking.scheduledDateTime) >= new Date() // Only future bookings
        );
        setUnavailableBookings(technicianBookings);
      } catch (error) {
        console.error('Failed to load unavailable dates:', error);
        // Don't block the UI if we can't load unavailable dates
        setUnavailableBookings([]);
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
    // Create date in local timezone by combining date and time
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const day = selectedDate.getDate();
    const dateTime = new Date(year, month, day, parseInt(hours), parseInt(minutes), 0, 0);
    
    // Convert to ISO string - this will include timezone offset
    // The backend should store this as-is, and we'll display it in local time
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
        boxShadow: '0 2px 8px rgba(3, 43, 90, 0.08)',
        borderRadius: 4,
        border: '1px solid #e8eaed',
        height: '100%',
        position: 'sticky',
        top: 20,
        bgcolor: 'white',
      }}
    >
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              bgcolor: '#F4C542',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(244, 197, 66, 0.2)',
            }}
          >
            <CalendarTodayIcon sx={{ color: '#032B5A', fontSize: 26 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#032B5A', mb: 0.25, fontSize: '1.25rem' }}>
              Date et heure
            </Typography>
            <Typography variant="caption" sx={{ color: '#666', fontWeight: 500 }}>
              Sélectionnez un créneau disponible
            </Typography>
          </Box>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress sx={{ color: '#F4C542' }} />
          </Box>
        ) : (
          <>
            {/* Date Selection */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2.5, color: '#032B5A', fontSize: '0.95rem' }}>
                Sélectionnez une date
              </Typography>
              <Box
                sx={{
                  maxHeight: 500,
                  overflowY: 'auto',
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    bgcolor: '#f5f5f5',
                    borderRadius: 3,
                  },
                  '&::-webkit-scrollbar-thumb': {
                    bgcolor: '#d1d5db',
                    borderRadius: 3,
                    '&:hover': {
                      bgcolor: '#9e9e9e',
                    },
                  },
                }}
              >
                {daysByMonth.map((monthData, monthIndex) => (
                  <Box key={monthIndex} sx={{ mb: monthIndex < daysByMonth.length - 1 ? 4 : 0 }}>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: 700, 
                        color: '#032B5A', 
                        mb: 2,
                        textTransform: 'capitalize',
                        fontSize: '1rem',
                      }}
                    >
                      {monthData.month}
                    </Typography>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, 1fr)',
                        gap: 1.5,
                        p: 2,
                        bgcolor: '#fafbfc',
                        borderRadius: 3,
                        border: '1px solid #e8eaed',
                      }}
                    >
                      {monthData.days.map((day, index) => {
                  const isUnavailable = isDateUnavailable(day);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isPast = isBefore(day, startOfDay(new Date()));
                  const isToday = isSameDay(day, new Date());

                  return (
                    <Box
                      key={index}
                      sx={{
                        position: 'relative',
                      }}
                    >
                      <Button
                        onClick={() => handleDateSelect(day)}
                        disabled={isUnavailable || isPast}
                        sx={{
                          minWidth: 44,
                          height: 64,
                          p: 0,
                          borderRadius: 3,
                          position: 'relative',
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
                          : '1px solid #e8eaed',
                        boxShadow: isSelected ? '0 2px 8px rgba(244, 197, 66, 0.2)' : 'none',
                        '&:hover': {
                          bgcolor: isUnavailable || isPast
                            ? undefined
                            : isSelected
                            ? '#e0b038'
                            : 'rgba(244, 197, 66, 0.08)',
                          borderColor: isUnavailable || isPast
                            ? undefined
                            : isSelected
                            ? '#F4C542'
                            : '#F4C542',
                          transform: isUnavailable || isPast ? undefined : 'translateY(-2px)',
                          boxShadow: isUnavailable || isPast ? 'none' : '0 4px 12px rgba(244, 197, 66, 0.15)',
                        },
                        '&:disabled': {
                          color: isUnavailable ? '#d32f2f' : '#9e9e9e',
                          bgcolor: isUnavailable ? '#ffebee' : '#f5f5f5',
                        },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Box sx={{ textAlign: 'center', width: '100%', position: 'relative' }}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            display: 'block', 
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            mb: 0.5,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                            opacity: isUnavailable || isPast ? 0.6 : 1,
                          }}
                        >
                          {format(day, 'EEE')}
                        </Typography>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontSize: '1.3rem',
                            fontWeight: isSelected || isToday ? 700 : 600,
                            opacity: isUnavailable || isPast ? 0.6 : 1,
                          }}
                        >
                          {format(day, 'd')}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontSize: '0.65rem',
                            color: isToday ? '#F4C542' : 'inherit',
                            fontWeight: isToday ? 700 : 500,
                            mt: 0.5,
                            opacity: isUnavailable || isPast ? 0.6 : 1,
                          }}
                        >
                          {format(day, 'MMM')}
                        </Typography>
                        {isUnavailable && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: '#d32f2f',
                              border: '1px solid white',
                            }}
                          />
                        )}
                      </Box>
                    </Button>
                    </Box>
                      );
                    })}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Time Selection */}
            {selectedDate && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2.5, color: '#032B5A', fontSize: '0.95rem' }}>
                  Sélectionnez une heure
                </Typography>
                {isDateUnavailable(selectedDate) ? (
                  <Alert 
                    severity="warning" 
                    sx={{ 
                      borderRadius: 3,
                      bgcolor: '#fffbf0',
                      border: '1px solid #F4C542',
                    }}
                  >
                    Cette date n'est pas disponible
                  </Alert>
                ) : (
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 1.5,
                      maxHeight: 240,
                      overflowY: 'auto',
                      p: 2,
                      bgcolor: '#fafbfc',
                      borderRadius: 3,
                      border: '1px solid #e8eaed',
                      '&::-webkit-scrollbar': {
                        width: '6px',
                      },
                      '&::-webkit-scrollbar-track': {
                        bgcolor: '#f5f5f5',
                        borderRadius: 3,
                      },
                      '&::-webkit-scrollbar-thumb': {
                        bgcolor: '#d1d5db',
                        borderRadius: 3,
                        '&:hover': {
                          bgcolor: '#9e9e9e',
                        },
                      },
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
                          startIcon={<AccessTimeIcon sx={{ fontSize: 18 }} />}
                          sx={{
                            borderRadius: 3,
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
                              : '1px solid #e8eaed',
                            boxShadow: isSelected ? '0 2px 8px rgba(244, 197, 66, 0.2)' : 'none',
                            py: 1.25,
                            '&:hover': {
                              bgcolor: isUnavailable
                                ? undefined
                                : isSelected
                                ? '#e0b038'
                                : 'rgba(244, 197, 66, 0.08)',
                              borderColor: isUnavailable
                                ? undefined
                                : isSelected
                                ? '#F4C542'
                                : '#F4C542',
                              transform: isUnavailable ? undefined : 'translateY(-1px)',
                              boxShadow: isUnavailable ? 'none' : '0 4px 12px rgba(244, 197, 66, 0.15)',
                            },
                            '&:disabled': {
                              color: '#d32f2f',
                              bgcolor: '#ffebee',
                            },
                            fontSize: '0.9rem',
                            fontWeight: isSelected ? 700 : 600,
                            textTransform: 'none',
                            transition: 'all 0.2s ease',
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
            <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #e8eaed' }}>
              <Typography variant="caption" sx={{ fontWeight: 600, mb: 2, display: 'block', color: '#032B5A', fontSize: '0.85rem' }}>
                Légende
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: 2,
                      bgcolor: '#F4C542',
                      border: '1px solid #e8eaed',
                      boxShadow: '0 1px 3px rgba(244, 197, 66, 0.2)',
                    }}
                  />
                  <Typography variant="caption" sx={{ color: '#666', fontWeight: 500, fontSize: '0.85rem' }}>
                    Disponible
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: 2,
                      bgcolor: '#ffebee',
                      border: '2px solid #d32f2f',
                    }}
                  />
                  <Typography variant="caption" sx={{ color: '#666', fontWeight: 500, fontSize: '0.85rem' }}>
                    Indisponible
                  </Typography>
                </Box>
              </Box>
            </Box>

            {selectedDate && selectedTime && (
              <Alert 
                severity="success" 
                sx={{ 
                  mt: 3, 
                  borderRadius: 3,
                  bgcolor: '#f1f8f4',
                  border: '1px solid #4caf50',
                  boxShadow: '0 2px 8px rgba(76, 175, 80, 0.1)',
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                  ✓ {format(selectedDate, 'EEEE d MMMM yyyy')} à {selectedTime}
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

