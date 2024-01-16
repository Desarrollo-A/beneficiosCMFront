import PropTypes from 'prop-types';
import { useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import LinearProgress from '@mui/material/LinearProgress';

import { endpoints } from 'src/utils/axios';

import { useGetGeneral, usePostGeneral } from 'src/api/general';

import { fPercent, fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

export default function EncuestaPorcentaje({ title, subheader, data, user, handleChangePg, selectPg, idEncuesta, idArea, idPregunta, handleChangeIdPg, ...other }) {

  const { preguntaData } = usePostGeneral(user.puesto, endpoints.dashboard.getPregunta, "preguntaData");

  const [pregunta, setPregunta] = useState(idPregunta);

  const handleChangeSeries = useCallback(
    (e) => {
      handleChangePg([
        { idPregunta: e.target.value },
        { idEncuesta },
        { idArea },
      ]);

      handleChangeIdPg(e.target.value);

      setPregunta(e.target.value)
    },
    [handleChangePg, idEncuesta, idArea, handleChangeIdPg]
  );
  
  return (

    <Card {...other}>

      <Stack
        spacing={1}
        alignItems={{ xs: 'flex-start', md: 'flex-start' }}
        direction={{
          xs: 'column',
          md: 'row',
        }}
        sx={{
          p: 1,
          pr: { xs: 1, md: 1 },
        }}
      >
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Pregunta</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            label="Pregunta"
            value={pregunta}
            onChange={(e) => handleChangeSeries(e)}
          >
            {preguntaData.map((i) => (
              <MenuItem key={i.idPregunta} value={i.idPregunta}>
                {i.pregunta}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

      </Stack>

      <CardHeader title={title} subheader={subheader} />

      <Stack spacing={4} sx={{ px: 3, pt: 3, pb: 5 }}>
        {data.map((progress) => (
          <ProgressItem key={progress.label} progress={progress} />
        ))}
      </Stack>

    </Card>
  );

}

EncuestaPorcentaje.propTypes = {
  data: PropTypes.array,
  subheader: PropTypes.string,
  title: PropTypes.string,
  user: PropTypes.object,
  handleChangePg: PropTypes.func,
  handleChangeIdPg: PropTypes.func,
  selectPg: PropTypes.string,
  idEncuesta: PropTypes.number,
  idArea: PropTypes.number,
  idPregunta: PropTypes.number,
};

// ----------------------------------------------------------------------

function ProgressItem({ progress }) {

  return (
    <Stack spacing={1}>
      <Stack direction="row" alignItems="center">

        <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
          {progress.label}
        </Typography>

        <Typography variant="subtitle2">{fPercent(progress.value)}</Typography>

        {/* <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          &nbsp;({fPercent(progress.value)})
        </Typography> */}
      </Stack>

      <LinearProgress
        variant="determinate"
        value={progress.value}
        color={
          (progress.label === 'Si' && 'info') ||
          (progress.label === 'No' && 'warning') ||
          'primary'
        }
      />
    </Stack>
  );
}

ProgressItem.propTypes = {
  progress: PropTypes.object,
};
