// FloatingCircleTimer.js
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';

import { doEventCancelaCitas } from 'src/api/calendar-colaborador';

export default function FloatingCircleTimer({ benefit, leftTime, appointmentMutate, topOffset }) {
  const [time, setTime] = useState(1);

  useEffect(() => {
    if (time === 2000) {
      updateStatusAppointment();
    }

    if (time > 0) {
      const timerId = setInterval(() => {
        setTime((prevTime) => prevTime - 1000);
      }, 1000);

      return () => clearInterval(timerId);
    }
  }, [time]);
  // Asi mero esta bien porque si no creo que cicla xddd

  useEffect(() => {
    setTime(leftTime);
  }, [leftTime]);

  const updateStatusAppointment = async () => {
    const event = await doEventCancelaCitas();
    console.log(event);
    appointmentMutate();
  };

  const formatTime = (ms) => {
    if (ms === 0) return '00:00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours < 10 ? '0' : ''}${hours}h ${minutes < 10 ? '0' : ''}${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;
  };

  return (
    <Stack
      sx={{
        position: 'relative',
        top: topOffset,
        right: 0,
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        display: time > 0 ? 'flex' : 'none',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '14px',
        textAlign: 'center',
        padding: '10px',
        boxSizing: 'border-box',
        zIndex: 9999, // Asegura que esté sobre todos los elementos
        margin: '10px 0', // Añadir margen para que no se toquen
      }}
    >
      <Stack sx={{ justifyContent: 'center', alignItems: 'center' }}>
        Tiempo para pagar tu cita de {benefit}
      </Stack>
      <Stack sx={{ justifyContent: 'center', alignItems: 'center' }}>{formatTime(time)}</Stack>
    </Stack>
  );
}

FloatingCircleTimer.propTypes = {
  benefit: PropTypes.string,
  leftTime: PropTypes.number,
  topOffset: PropTypes.number,
  appointmentMutate: PropTypes.func,
};
