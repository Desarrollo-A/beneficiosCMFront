import { mutate } from 'swr';
import { useEffect } from 'react';

import { InputAdornment, Stack, TextField } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import { endpoints } from 'src/utils/axios';

import { useGetGeneral } from 'src/api/general';
import Searchbar from 'src/layouts/common/searchbar';

import Iconify from 'src/components/iconify';
import { LoadingScreen } from 'src/components/loading-screen';
// ----------------------------------------------------------------------

export default function ListaPreguntas() {
  useEffect(() => {
    mutate(endpoints.ayuda.getFaqs);
  }, []);

  const { faqsData } = useGetGeneral(endpoints.gestor.getFaqsCh, 'faqsData');

  const search = () => {
    console.log("si");
    
  }

  return (
    <Stack>
      {/* <TextField
          fullWidth
        //   value={filters.name}
          onChange={search}
          placeholder="Buscar"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        /> */}
      
      {faqsData.length > 0 ? faqsData.map((accordion) => (
        <Accordion key={accordion.id}>
          <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
            <Typography variant="subtitle1">{accordion.pregunta}</Typography>
          </AccordionSummary>

          <AccordionDetails>
            <Typography>{accordion.respuesta}</Typography>
          </AccordionDetails>
        </Accordion>
      )) : <LoadingScreen
      sx={{
        borderRadius: 1.5,
        bgcolor: 'background.default',
      }}
    />}
    </Stack>
  );
}
