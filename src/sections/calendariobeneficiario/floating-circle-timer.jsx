// FloatingCircleTimer.js
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import Stack from '@mui/system/Stack';

export default function FloatingCircleTimer({ benefit, leftTime }) {
  const [time, setTime] = useState(leftTime);

  useEffect(() => {
    if (time > 0) {
      const timerId = setInterval(() => {
        setTime((prevTime) => prevTime - 1000);
      }, 1000);

      return () => clearInterval(timerId); // Esta es la función de limpieza.
    }
  }, [time]);

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <Stack
      style={{
        position: 'relative',
        top: `0px`,
        right: '0px',
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
      <Stack sx={{ justifyContent: 'center', alignItems: 'center' }}>{formatTime(time)}s</Stack>
    </Stack>
  );
}

FloatingCircleTimer.propTypes = {
  benefit: PropTypes.string,
  leftTime: PropTypes.number,
};
