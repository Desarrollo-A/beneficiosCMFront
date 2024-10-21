import { mutate } from 'swr';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { useBoolean } from 'src/hooks/use-boolean';

import { endpoints } from 'src/utils/axios';

import { useUpdate } from 'src/api/reportes';
import { useAuthContext } from 'src/auth/hooks';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export default function TableSolicitudBoletos({ row, selected, onViewRow }) {
  const { id, nombre, num_empleado, beneficiario, ndepto, nsede, fechaCreacion, telefono_personal, solicitud } = row;

  const confirm = useBoolean();

  const active = useBoolean();

  const { user } = useAuthContext();

  const idUser = {idUser : user?.idUsuario};

  const updateEstatus = useUpdate(endpoints.boletos.updateSolicitudBoletos);

  const { enqueueSnackbar } = useSnackbar();

  const popover = usePopover();

  const handleEstatus = async (dt) => {

    const data = {
      ...dt,
      ...idUser,
      estatus:1
    };

    try {

      if (data) {

        confirm.onFalse();
        active.onFalse()

        const update = await updateEstatus(data);

        if (update.result === true) {
          enqueueSnackbar(update.msg, { variant: 'success' });

          mutate(endpoints.boletos.getSolicitudBoletos);
          mutate(endpoints.boletos.getBoletos);

        } else {
          enqueueSnackbar(update.msg, { variant: 'error' });
        }

      } else {
        enqueueSnackbar(`¡Erro en enviar los datos!`, { variant: 'danger' });
      }

    } catch (error) {
      enqueueSnackbar(`¡No se pudieron actualizar los datos!`, { variant: 'danger' });
    }
  }

  const renderPrimary = (
      <TableRow hover selected={selected}>

        <TableCell>
          <Box
          >
            {id}
          </Box>
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{nombre}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{num_empleado}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{beneficiario}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{ndepto}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{nsede}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fechaCreacion}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{telefono_personal}</TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={
              (solicitud === 1 && 'success') ||
              (solicitud === 0 && 'error')
            }
          >
            {solicitud === 1 ? 'APROBADA' : 'SIN APROBAR'}
          </Label>
        </TableCell>

        {solicitud === 0 ? (
        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>

          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
        ):(
          null
        )}
      </TableRow>
  );

  return (
    <>
      {renderPrimary}

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
          <MenuItem
            onClick={() => {
              active.onTrue();
              popover.onClose();
            }}
            sx={{ color: 'success.main' }}
          >
            <Iconify icon="material-symbols:check-box" />
            APROBAR
          </MenuItem>

      </CustomPopover>

      <ConfirmDialog
        open={active.value}
        onClose={active.onFalse}
        title="APROBAR SOLICITUD DE BOLETOS"
        content='¿Estás seguro de aprobar la solicitud de boletos para esté colaborador?'
        action={
          <>
            <Button variant="contained" color="success" onClick={() => {
              handleEstatus(row);
              confirm.onFalse();
            }}>
              Aceptar
            </Button>
            <Button variant="contained" color="error" onClick={() => { active.onFalse() }}>
              Cancelar
            </Button>
          </>
        }
      />

    </>
  );
}

TableSolicitudBoletos.propTypes = {
  onViewRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
