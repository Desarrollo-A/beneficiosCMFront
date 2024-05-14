import { mutate } from 'swr';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

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

export default function PuestosTableRow({ row, selected, onViewRow }) {
  const { id, puesto, estatus } = row;

  const confirm = useBoolean();

  const { user } = useAuthContext();

  const idUser = {idUser : user.idUsuario};

  const active = useBoolean();

  const { enqueueSnackbar } = useSnackbar();

  const popover = usePopover();

  const updateEstatus = useUpdate(endpoints.gestor.updateEstatusPuestos);

  const handleEstatus = async (i) => {

    const data = {
      ...i,
      ...idUser,
    };

    try {

      if (data) {

        confirm.onFalse();
        active.onFalse()

        const update = await updateEstatus(data);

        if (update.result === true) {
          enqueueSnackbar(update.msg, { variant: 'success' });

          mutate(endpoints.gestor.getDepartamentos);
          mutate(endpoints.gestor.getAreasPs);
          mutate(endpoints.gestor.getPuestos);

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
          onClick={onViewRow}
          sx={{
            cursor: 'pointer',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          {id}
        </Box>
      </TableCell>

      <TableCell sx={{ display: 'flex', alignItems: 'center' }}>

        <ListItemText
          primary={puesto}
          primaryTypographyProps={{ typography: 'body2' }}
          secondaryTypographyProps={{
            component: 'span',
            color: 'text.disabled',
          }}
        />
      </TableCell>

      <TableCell>
        <Label
          variant="soft"
          color={
            (estatus === 1 && 'success') ||
            (estatus === 0 && 'error')
          }
        >
          {estatus === 1 ? 'ACTIVA' : 'INACTIVA'}
        </Label>
      </TableCell>

      <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>

        <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </TableCell>
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
        {estatus === 1 ? (
          <MenuItem
            onClick={() => {
              confirm.onTrue();
              popover.onClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="material-symbols:disabled-by-default" />
            Inhabilitar
          </MenuItem>
        ) : (
          <MenuItem
            onClick={() => {
              active.onTrue();
              popover.onClose();
            }}
            sx={{ color: 'success.main' }}
          >
            <Iconify icon="material-symbols:check-box" />
            Habilitar
          </MenuItem>
        )}
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Inhabilitar"
        content="¿Estás seguro de inhabilitar el puesto?"
        action={
          <>
            <Button variant="contained" color="error" onClick={() => {confirm.onFalse()}}>
              Cancelar
            </Button>
            <Button variant="contained" color="success" onClick={() => {
              handleEstatus(row);
              confirm.onFalse();
            }}>
              Aceptar
            </Button>
          </>
        }
      />

      <ConfirmDialog
        open={active.value}
        onClose={active.onFalse}
        title="Habilitar"
        content="¿Estás seguro de habilitar el puesto?"
        action={
          <>
            <Button variant="contained" color="error"onClick={() => {active.onFalse()}}>
              Cancelar
            </Button>
            <Button variant="contained" color="success" onClick={() => {
              handleEstatus(row);
              confirm.onFalse();
            }}>
              Aceptar
            </Button>
            
          </>
        }
      />
    </>
  );
}

PuestosTableRow.propTypes = {
  onViewRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
