import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import { endpoints } from 'src/utils/axios';

import { useAuthContext } from 'src/auth/hooks';
import { useGetGeneral } from 'src/api/general';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function FaqsList() {

  const { user } = useAuthContext();

  const rol = user?.idRol;

  const { faqsData } = useGetGeneral(endpoints.ayuda.getFaqs, "faqsData");

  return (
    <div>
      {faqsData.map((accordion) => (
        rol === accordion.idRol ? (
        <Accordion key={accordion.id}>
          <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
            <Typography variant="subtitle1">{accordion.titulo}</Typography>
          </AccordionSummary>

          <AccordionDetails>
            <Typography>{accordion.descripcion}</Typography>
          </AccordionDetails>
        </Accordion>
      ) : ( 
        null
      )
      ))}
    </div>
  );
}
