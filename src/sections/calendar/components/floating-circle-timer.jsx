// FloatingCircleTimer.js
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import { useTheme } from '@mui/material/styles';

import { doEventCancelaCitas } from 'src/api/calendar-colaborador';

export default function FloatingCircleTimer({ benefit, leftTime, appointmentMutate, topOffset }) {

  const theme = useTheme();
  
  const [time, setTime] = useState(leftTime);
  const [dashArray, setDashArray] = useState('283 283'); // Valor inicial para el SVG

  /* eslint-disable */
  useEffect(() => {
    if (time === 0) {
      updateStatusAppointment();
    }

    if (time > 0) {
      const timerId = setInterval(() => {
        setTime((prevTime) => {
          const newTime = prevTime - 1000;
          const fraction = newTime / leftTime;
          const circleDashArray = `${283 * fraction} 283`; // Recalcula el dash array
          setDashArray(circleDashArray);
          return newTime;
        });
      }, 1000);

      return () => clearInterval(timerId);
    }
  }, [time, leftTime]);

  const updateStatusAppointment = async () => {
    const event = await doEventCancelaCitas();
    console.log(event);
    appointmentMutate();
  };

  const formatTime = (ms) => {
    if (ms <= 0) return '00:00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours < 10 ? '0' : ''}${hours}h ${minutes < 10 ? '0' : ''}${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;
  };

  const calculateColor = () => {
    if (time <= leftTime * 0.25) return 'red';
    if (time <= leftTime * 0.5) return 'orange';
    return 'green';
  };

  return (
    <div
    className="fade-in"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        display: time > 0 ? 'block' : 'none',
        zIndex: 9999,
        textAlign: 'center'
      }}
    >
      <div className="base-timer"  style={{
        position: 'fixed',
        bottom: '20px',
        right: '10px', 
        display: time > 0 ? 'block' : 'none',
        zIndex: 9999,
        textAlign: 'center',
        margin:'10px'
      }}>
        <svg className="base-timer__svg" viewBox="0 0 100 100">
          <g className="base-timer__circle">
            <circle className="base-timer__path-elapsed" cx="50" cy="50" r="45" />
            <path
              id="base-timer-path-remaining"
              strokeDasharray={dashArray}
              className={`base-timer__path-remaining ${calculateColor()}`}
              d="
                M 50, 50
                m -45, 0
                a 45,45 0 1,0 90,0
                a 45,45 0 1,0 -90,0
              "
            />
          </g>
        </svg>
        <span className="base-timer__label" style={{color: theme.palette.mode === 'dark' ? 'black' : 'white'}}>
          {formatTime(time)}
          </span>
        <span className="base-timer__label_text" style={{color: theme.palette.mode === 'dark' ? 'black' : 'white'}}>
          Tiempo restante para pago de cita
        </span>
      </div>
      
    </div>
  );
}

FloatingCircleTimer.propTypes = {
  benefit: PropTypes.string,
  leftTime: PropTypes.number,
  topOffset: PropTypes.number,
  appointmentMutate: PropTypes.func,
};
