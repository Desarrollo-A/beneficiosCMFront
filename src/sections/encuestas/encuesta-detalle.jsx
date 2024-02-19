import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import { endpoints } from 'src/utils/axios';

import { useGetGeneral, usePostGeneral } from 'src/api/general';

// ----------------------------------------------------------------------

export default function FormularioEncuesta({ idEncuesta }) {

  const { encuestaData } = usePostGeneral(idEncuesta, endpoints.encuestas.getEncuesta, "encuestaData");

  console.log(encuestaData)

  const { Resp1Data } = useGetGeneral(endpoints.encuestas.getResp1, "Resp1Data");

  const { Resp2Data } = useGetGeneral(endpoints.encuestas.getResp2, "Resp2Data");

  const { Resp3Data } = useGetGeneral(endpoints.encuestas.getResp3, "Resp3Data");

  const { Resp4Data } = useGetGeneral(endpoints.encuestas.getResp4, "Resp4Data");

  return (

        <Grid container spacing={3}>

          <Grid xs={12} md={12}>
            <Card sx={{ p: 3 }}>
              <Box
                rowGap={3}
                columnGap={1}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(1, 1fr)',
                }}
              >

                {encuestaData.map((item) => (

                  <Stack spacing={1} key={item.pregunta}>

                    <Typography variant="subtitle2" >
                      {item.pregunta}
                    </Typography>

                    {item.respuestas === "1" && (
                      <Typography variant="subtitle2" > Respuestas: {Resp1Data.map((i) => i.label).join(', ')} </Typography>
                    )}

                    {item.respuestas === "2" && (
                      <Typography variant="subtitle2" > Respuestas: {Resp2Data.map((i) => i.label).join(', ')} </Typography>
                    )}

                    {item.respuestas === "3" && (
                      <Typography variant="subtitle2" > Respuestas: {Resp3Data.map((i) => i.label).join(', ')} </Typography>
                    )}

                    {item.respuestas === "4" && (
                      <Typography variant="subtitle2" > Respuestas: {Resp4Data.map((i) => i.label).join(', ')} </Typography>
                    )}

                    {item.respuestas === "5" && (
                      <Typography variant="subtitle2" > Respuesta: Abierta corta </Typography>
                    )}

                    {item.respuestas === "6" && (
                      <Typography variant="subtitle2" > Respuestas: Abierta larga </Typography>
                    )}

                  </Stack>
                ))}
              </Box>

            </Card>
          </Grid>
        </Grid>
  );
}

FormularioEncuesta.propTypes = {
  idEncuesta: PropTypes.any,
};