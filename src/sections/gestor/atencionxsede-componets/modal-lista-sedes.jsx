import PropTypes from 'prop-types';
import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import DialogTitle from '@mui/material/DialogTitle';
import ListItemText from '@mui/material/ListItemText';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useBoolean } from 'src/hooks/use-boolean';

import { fData } from 'src/utils/format-number';

import Iconify from 'src/components/iconify';
import { usePopover } from 'src/components/custom-popover';

import ModalAsignarSede from './modal-asignar-sede';

// ----------------------------------------------------------------------

export default function ModalListaSedes({ idPuesto, open, onClose, modalidadesData, sedesData }) {

  const popover = usePopover();

  const modal = useBoolean();

  const [sd, setSd] = useState(0);

  const [open2, setOpen2] = useState(false);

  const handleOpen = (idSede) => {
    setSd(idSede);
    setOpen2(true);
  }

  const handleClose = () => {
    setSd(0);
    setOpen2(false);
  }


  return (
    <>
      <Dialog
        fullWidth
        maxWidth={false}
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: { maxWidth: 420 },
        }}
      >

        <DialogTitle>Asignación de sede</DialogTitle>

        <>
          <DialogContent>

            {sedesData.map((e) => (
              <React.Fragment key={e.idSede}>
                <ListItemText
                  primary={e.sede}
                  secondary={
                    <>
                      {fData(e.size)}
                      <Box
                        sx={{
                          mx: 0.75,
                          width: 2,
                          height: 2,
                          borderRadius: '50%',
                        }}
                      />
                    </>
                  }
                  primaryTypographyProps={{
                    noWrap: true,
                    typography: 'subtitle2',
                  }}
                  secondaryTypographyProps={{
                    mt: 0.5,
                    component: 'span',
                    alignItems: 'center',
                    typography: 'caption',
                    color: 'text.disabled',
                    display: 'inline-flex',
                  }}
                />

                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    handleOpen(e.idSede);
                  }}
                  sx={{
                    top: -20,
                    left: 250,
                  }}
                >
                  Asignar <Iconify icon="lets-icons:add-duotone" />
                </Button>

                <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
              </React.Fragment>

            ))}

          </DialogContent>

          <DialogActions>
            <Button variant="contained" color="error" onClick={onClose}>
              Cerrar
            </Button>

          </DialogActions>
        </>
      </Dialog>

      <Dialog
        fullWidth
        maxWidth={false}
        open={open2}
        onClose={popover.onClose}
        PaperProps={{
          sx: { maxWidth: 1000 },
        }}
      >
        <ModalAsignarSede idSede={sd} idPuesto={idPuesto} open={modal.value} onClose={handleClose} modalidadesData={modalidadesData} />
      </Dialog>
    </>
  );
}

ModalListaSedes.propTypes = {
  idPuesto: PropTypes.any,
  onClose: PropTypes.any,
  open: PropTypes.bool,
  modalidadesData: PropTypes.any,
  sedesData: PropTypes.any,
};
