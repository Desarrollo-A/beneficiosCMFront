import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import ListItemText from '@mui/material/ListItemText';
import Accordion from '@mui/material/Accordion';
import AccordionActions from '@mui/material/AccordionActions';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import { endpoints } from 'src/utils/axios';

import { usePostGeneral } from 'src/api/general';
import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import { fData } from 'src/utils/format-number';

import { useAuthContext } from 'src/auth/hooks';

import Iconify from 'src/components/iconify';

import BankingContacts from './banking-contacts';
import ModalAsignarSede from './modal-asignar-sede';

// ----------------------------------------------------------------------

export default function SedeSnAsignar({ onDelete, sx, modalidadesData, puestosData, ...other }) {

  const { user } = useAuthContext();

  const { sedData } = usePostGeneral(user.idPuesto, endpoints.gestor.getSedeNoneEsp, "sedData");

  const smUp = useResponsive('up', 'sm');

  const details = useBoolean();

  const modal = useBoolean();

  const [sd, setSd] = useState(0);

  const [open2, setOpen2] = useState(false);
  const [close2, setClose2] = useState(false);

  const handleOpen = (idSede) => {
    setOpen2(true);
    setSd(idSede);
  }

  const handleClose = () => {
    setOpen2(false);
  }

  return (
    <>

      {user.idRol === "1" || user.idRol === 1 ? (
        <BankingContacts
          title="Contacts"
          subheader="You have 122 contacts"
          list={puestosData}
          modalidadesData={modalidadesData}
        />
      ) : (
        <>
          {sedData.map((e, index) => (
            <Stack
              component={Paper}
              variant="outlined"
              spacing={1}
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'unset', sm: 'center' }}
              sx={{
                borderRadius: 2,
                bgcolor: 'unset',
                cursor: 'pointer',
                position: 'relative',
                p: { xs: 2.5, sm: 2 },
                '&:hover': {
                  bgcolor: 'background.paper',
                  boxShadow: (theme) => theme.customShadows.z20,
                },
                ...sx,
              }}
              {...other}
            >

              <ListItemText
                key={1}
                onClick={details.onTrue}
                primary={e.sede}
                secondary={
                  <>
                    {fData()}
                    <Box
                      sx={{
                        mx: 0.75,
                        width: 2,
                        height: 2,
                        borderRadius: '50%',
                        bgcolor: 'currentColor',
                      }}
                    />
                    {"Fecha de creación: "}{e.fechaCreacion}
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
              <Box
                sx={{
                  top: 0,
                  right: 8,
                  position: 'absolute',
                  ...(smUp && {
                    flexShrink: 0,
                    position: 'unset',
                  }),
                }}
              >

                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    handleOpen(e.idSede);
                  }}
                >
                  Asignar <Iconify icon="lets-icons:add-duotone" />
                </Button>
              </Box>

            </Stack>
          ))}
        </>
      )}

      <Dialog
        fullWidth
        maxWidth={false}
        open={open2}
        onClose={close2}
        PaperProps={{
          sx: { maxWidth: 720 },
        }}
      >
        <ModalAsignarSede
          idSede={sd}
          idPuesto={user.idPuesto}
          open={modal.value}
          onClose={handleClose}
          modalidadesData={modalidadesData}
        />
      </Dialog>

    </>
  );
}

SedeSnAsignar.propTypes = {
  onDelete: PropTypes.func,
  sx: PropTypes.object,
  modalidadesData: PropTypes.any,
  puestosData: PropTypes.any,
};
