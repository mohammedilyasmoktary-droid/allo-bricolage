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
  IconButton,
} from '@mui/material';
import { bookingsApi, Booking } from '../api/bookings';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { format, addDays, isSameDay, isBefore, startOfDay, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

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
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date()));

  // Get only the days of the current month (no padding days)
  const getCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  };

  const calendarDays = getCalendarDays();
  
  // Get the first day of the month to calculate padding
  const getFirstDayOfWeek = (): number => {
    const firstDay = startOfMonth(currentMonth);
    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = firstDay.getDay();
    // Convert to Monday = 0 format
    return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  };

  const firstDayPadding = getFirstDayOfWeek();

  // Navigate to previous month
  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  // Navigate to next month
  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

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
        overflow: 'hidden',
        maxWidth: '100%',
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 3 }, overflow: 'hidden', maxWidth: '100%', boxSizing: 'border-box' }}>
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
              
              {/* Month Navigation */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  mb: 2,
                  px: 0.5,
                }}
              >
                <IconButton
                  onClick={handlePreviousMonth}
                  size="small"
                  sx={{
                    color: '#032B5A',
                    bgcolor: '#f5f5f5',
                    width: 32,
                    height: 32,
                    '&:hover': {
                      bgcolor: '#e0e0e0',
                    },
                  }}
                >
                  <ChevronLeftIcon fontSize="small" />
                </IconButton>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700, 
                    color: '#032B5A',
                    textTransform: 'capitalize',
                    fontSize: '1rem',
                    textAlign: 'center',
                    flex: 1,
                    mx: 1,
                  }}
                >
                  {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                </Typography>
                <IconButton
                  onClick={handleNextMonth}
                  size="small"
                  sx={{
                    color: '#032B5A',
                    bgcolor: '#f5f5f5',
                    width: 32,
                    height: 32,
                    '&:hover': {
                      bgcolor: '#e0e0e0',
                    },
                  }}
                >
                  <ChevronRightIcon fontSize="small" />
                </IconButton>
              </Box>

              {/* Weekday Headers */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: 0.5,
                  mb: 1,
                  px: 0.5,
                }}
              >
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                  <Typography
                    key={day}
                    variant="caption"
                    sx={{
                      textAlign: 'center',
                      fontWeight: 700,
                      color: '#666',
                      fontSize: '0.7rem',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      py: 0.5,
                    }}
                  >
                    {day}
                  </Typography>
                ))}
              </Box>

              {/* Calendar Grid */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: 0.5,
                  p: 1,
                  bgcolor: '#fafbfc',
                  borderRadius: 3,
                  border: '1px solid #e8eaed',
                  width: '100%',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                }}
              >
                {/* Empty cells for days before month starts */}
                {Array.from({ length: firstDayPadding }).map((_, index) => (
                  <Box key={`padding-${index}`} sx={{ aspectRatio: '1', minHeight: 0 }} />
                ))}
                
                {/* Actual month days */}
                {calendarDays.map((day, index) => {
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
                        minWidth: 0,
                        width: '100%',
                        aspectRatio: '1',
                        p: 0,
                        borderRadius: 1.5,
                        position: 'relative',
                        bgcolor: isSelected
                          ? '#F4C542'
                          : isUnavailable
                          ? '#ffebee'
                          : isPast
                          ? 'transparent'
                          : isToday
                          ? 'rgba(244, 197, 66, 0.1)'
                          : 'white',
                        color: isSelected
                          ? '#032B5A'
                          : isUnavailable
                          ? '#d32f2f'
                          : isPast
                          ? '#d1d5db'
                          : '#032B5A',
                        border: isSelected
                          ? '2px solid #F4C542'
                          : isToday && !isSelected
                          ? '2px solid #F4C542'
                          : isUnavailable
                          ? '2px solid #d32f2f'
                          : '1px solid transparent',
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
                          transform: isUnavailable || isPast ? undefined : 'translateY(-1px)',
                          boxShadow: isUnavailable || isPast ? 'none' : '0 2px 8px rgba(244, 197, 66, 0.15)',
                        },
                        '&:disabled': {
                          color: isUnavailable ? '#d32f2f' : '#d1d5db',
                          bgcolor: isUnavailable ? '#ffebee' : 'transparent',
                          opacity: isPast ? 0.4 : 1,
                        },
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontSize: { xs: '0.85rem', sm: '0.9rem' },
                          fontWeight: isSelected || isToday ? 700 : 600,
                          opacity: isUnavailable || isPast ? 0.6 : 1,
                        }}
                      >
                        {format(day, 'd')}
                      </Typography>
                      {isUnavailable && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 2,
                            right: 2,
                            width: 5,
                            height: 5,
                            borderRadius: '50%',
                            bgcolor: '#d32f2f',
                            border: '1px solid white',
                          }}
                        />
                      )}
                    </Button>
                  );
                })}
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

