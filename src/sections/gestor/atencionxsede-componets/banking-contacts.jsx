import { useState } from 'react';
import PropTypes from 'prop-types';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import { useBoolean } from 'src/hooks/use-boolean';

import Iconify from 'src/components/iconify';

import ModalListaSedes from './modal-lista-sedes';

// ----------------------------------------------------------------------

export default function BankingContacts({ title, subheader, list, modalidadesData, sedesData, ...other }) {
  const modal = useBoolean();

  const [ps, setPs] = useState(0);

  return (
    <Card {...other}>

      <Stack spacing={3} sx={{ p: 3 }}>
        {list.map((e, index) => (
          <Stack direction="row" alignItems="center" key={index}>

            <ListItemText primary={e.nombre} /* secondary={e.email} */ />

            <ModalListaSedes idPuesto={ps} modalidadesData={modalidadesData} sedesData={sedesData} open={modal.value} onClose={modal.onFalse} />

            <Tooltip title="Ver sedes">
              <IconButton onClick={() => {
                modal.onTrue();
                setPs(e.idPuesto);
              }}>
              <Iconify icon="eva:diagonal-arrow-right-up-fill" />
            </IconButton>
          </Tooltip>
          </Stack>
        ))}
    </Stack>
    </Card >
  );
}

BankingContacts.propTypes = {
  list: PropTypes.array,
  subheader: PropTypes.string,
  title: PropTypes.string,
  modalidadesData: PropTypes.any,
  sedesData: PropTypes.any,
};
