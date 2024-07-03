import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import Manuales from '../components/ayuda/manuales';
import FaqsList from '../components/ayuda/faqs-lista';

// ----------------------------------------------------------------------

export default function AyudaView() {

  const settings = useSettingsContext();

  return (

    <Container maxWidth={settings.themeStretch ? false : 'lg'}>

        <CustomBreadcrumbs
          heading="Ayuda"
          links={[{ },]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Manuales />

        <Typography
          variant="h6"
          sx={{
            my: { xs: 2, md: 2 },
          }}
        >
          Preguntas frecuentes
        </Typography>

        <Box
          gap={10}
          sx={{bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
          border: (theme) => `dashed 1px ${theme.palette.divider}`, mt: 3,
          width: 1,
          borderRadius: 2,}}
          display="grid"
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            md: 'repeat(1, 1fr)',
          }}
        >
          <FaqsList />
          
        </Box>

      </Container>

  );
}
