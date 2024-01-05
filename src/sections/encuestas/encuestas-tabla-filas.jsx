import { mutate } from 'swr';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { useBoolean } from 'src/hooks/use-boolean';

import { endpoints } from 'src/utils/axios';

import { useUpdate } from 'src/api/reportes';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import UserQuickEditForm from './modal-ver-encuesta';

// ----------------------------------------------------------------------

export default function EncuestasTablaFilas({ row, selected, est }) {
  const { idEncuesta, fechaCreacion, estatus } = row;

  const estatusCt = est[0].cantidadEstatus;

  const { enqueueSnackbar } = useSnackbar();

  const updateEstatus = useUpdate(endpoints.encuestas.updateEstatus);

  const confirm = useBoolean();

  const popover = usePopover();

  const fecha = new Date(fechaCreacion);

  const fechaForm = fecha.toISOString().split('T')[0];

  const handleEstatus = async (value1, value2) => {
    try {

      const data = {
        'idEncuesta': value1,
        'estatus': value2
      };

      console.log(value1)

      const update = await updateEstatus(data);

      if (update.estatus === true) {
        enqueueSnackbar(update.msj, { variant: 'success' });

        mutate(endpoints.encuestas.getEncuestasCreadas);
        mutate(endpoints.encuestas.getEncNotificacion);
        mutate(endpoints.encuestas.getEstatusUno);

      } else {
        enqueueSnackbar(update.msj, { variant: 'error' });
      }

    } catch (error) {
      console.error("Error en handleEstatus:", error);
      enqueueSnackbar(`¡No se pudieron actualizar los datos de usuario!`, { variant: 'danger' });
    }
  };

  const quickEdit = useBoolean();

  return (
    <>

      <TableRow hover selected={selected}>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{idEncuesta}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fechaForm}</TableCell>

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

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >

        {estatusCt === 0 ? (

          <MenuItem
            onClick={() => {
              confirm.onTrue();
              popover.onClose();
            }}
            sx={{ color: 'success.main' }}
          >
            <Iconify icon="mdi:success" />
            Habilitar
          </MenuItem>

        ) : (

          <>
          {estatus !== 0 ? (
          <MenuItem
            onClick={() => {
              confirm.onTrue();
              popover.onClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="pajamas:cancel" />
            Deshabilitar
          </MenuItem>
          ) : (
            <Iconify style={{ display: 'none' }} />
          )}
          </>
        )}

      <UserQuickEditForm idEncuesta={row.idEncuesta} open={quickEdit.value} onClose={quickEdit.onFalse} />

        {/* <Link
          to={`/dashboard/encuestas/detalle?idEncuesta=${row.idEncuesta}`}
          style={{ color: 'inherit', textDecoration: 'inherit' }}
        > */}
          <MenuItem
          onClick={quickEdit.onTrue}
          >
            <Iconify icon="mdi:eye" />
            Ver
          </MenuItem>
        {/* </Link> */}

      </CustomPopover>

      {estatusCt === 0 ? (

        <ConfirmDialog
          open={confirm.value}
          onClose={confirm.onFalse}
          title="Habilitar"
          content="¿Estás seguro de habilitar está encuesta?"
          action={
            <Button variant="contained" color="success" onClick={() => {
              handleEstatus(row.idEncuesta, 1);
              confirm.onFalse();
              popover.onClose();
            }}>
              Habilitar
            </Button>
          }
        />
        
      ) : (

        <ConfirmDialog
          open={confirm.value}
          onClose={confirm.onFalse}
          title="Deshabilitar"
          content="¿Estás seguro de deshabilitar está encuesta?"
          action={
            <Button variant="contained" color="error" onClick={() => {
              handleEstatus(row.idEncuesta, 0);
              confirm.onFalse();
              popover.onClose();
            }}>
              Deshabilitar
            </Button>
          }
        />
      )}
    </>
  );
}

EncuestasTablaFilas.propTypes = {
  row: PropTypes.object,
  selected: PropTypes.bool,
  est: PropTypes.array,
};
