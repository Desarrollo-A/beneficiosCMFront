import { mutate } from 'swr';
import PropTypes from 'prop-types';
import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import { Card, Grid } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import { endpoints } from 'src/utils/axios';

import Iconify from 'src/components/iconify';
// ----------------------------------------------------------------------

export default function ListaPreguntas({ faqsData, found, ...other }) {
  useEffect(() => {
    mutate(endpoints.ayuda.getFaqs);
  }, []);

  const [select, setSelect] = useState([]);

  const handleChange = (e, value, index) => {
    if (value) {
      setSelect((currentSelect) => [...select, index]);
    } else {
      setSelect((values) => values.filter((selected) => selected !== index));
    }
  };

  const heightCard = 330;
  const heightGrid = heightCard + 20;

  const isMobile = useMediaQuery('(max-width: 960px)');

  const [fade, setFade] = useState(
    'linear-gradient(to bottom, rgba(255, 255, 255, 1) 45%, rgba(255, 255, 255, 0) 100%)'
  );

  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;

    if (bottom) {
      setFade(`linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 45%)`);
    } else if (e.target.scrollTop === 0) {
      setFade(
        `linear-gradient(to bottom, rgba(255, 255, 255, 1) 45%, rgba(255, 255, 255, 0) 100%)`
      );
    } else {
      setFade(
        `linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 45%, rgba(255, 255, 255, 0) 100%)`
      );
    }
  };

  const containerRef = useRef(null);
  const [isScrollable, setIsScrollable] = useState(false);

  const checkScroll = () => {
    if (containerRef.current.scrollHeight > containerRef.current.clientHeight) {
      setIsScrollable(true);
    } else {
      setIsScrollable(false);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);

    return () => {
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  console.log(faqsData);

  return (
    <Box
      ref={containerRef}
      sx={{
        scrollbarWidth: 'none' /* Width of the scrollbar */,
        height: heightGrid,
        overflowY: 'auto',
        display: 'flex',
        flexGrow: 1,
        width: '100%',
        flexDirection: 'column',
        maxHeight: heightGrid,
        WebkitMaskImage: isMobile || !isScrollable ? 'none' : `${fade}`,
        alignItems: 'start',
      }}
      onScroll={handleScroll}
    >
      {faqsData.length || faqsData === 2 ? (
        <div style={{ width: '100%' }}>
          {faqsData !== 2 ? (
            faqsData.map((accordion, index) => (
              <Accordion
                key={accordion.id}
                sx={{
                  justifyContent: 'start',
                  '&:before': {
                    display: index === 0 ? 'none' : '',
                  },
                  width: '100%',
                }}
                disableGutters
                elevation={0}
                onChange={(e, value) => handleChange(e, value, index)}
              >
                <AccordionSummary
                  expandIcon={
                    <Iconify icon={select.indexOf(index) > -1 ? 'ph:minus' : 'ph:plus'} ml={2} />
                  }
                >
                  <Typography
                    align="left"
                    variant="subtitle1"
                    style={{
                      justifyContent: 'left',
                      color: select.indexOf(index) > -1 ? '#baa36b' : 'inherit',
                    }}
                  >
                    {accordion.pregunta}
                  </Typography>
                </AccordionSummary>

                <AccordionDetails>
                  <Typography align="left">{accordion.respuesta}</Typography>
                </AccordionDetails>
              </Accordion>
            ))
          ) : (
            <Typography
              align="left"
              variant="subtitle1"
              style={{
                justifyContent: 'left',
              }}
            >
              Sin preguntas
            </Typography>
          )}
        </div>
      ) : (
        // <CircularProgress size={40} />
        <div style={{ width: '100%', height: '100%' }}>
          {found ? (
            <Card {...other}>
              <Grid
                container
                spacing={1}
                sx={{ backgroundColor: '#ECECEC', animation: 'pulse 1.5s infinite', p: 5 }}
                justifyContent="center"
                alignItems="center"
              />
            </Card>
          ) : (
            <Typography
              align="left"
              variant="subtitle1"
              style={{
                justifyContent: 'left',
              }}
            >
              Sin coincidencias de busqueda
            </Typography>
          )}
        </div>
      )}
    </Box>
  );
}

ListaPreguntas.propTypes = {
  faqsData: PropTypes.any,
  found: PropTypes.bool
};
