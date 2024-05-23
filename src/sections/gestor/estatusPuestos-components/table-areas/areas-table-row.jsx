import { mutate } from 'swr';
import PropTypes from 'prop-types';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
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

import PuestosTable from '../table-puestos/puestos-table';


// ----------------------------------------------------------------------

export default function AreasTableRow({ row, selected, onViewRow, onFilters, onResetFilters }) {
  const { id, area, estatus } = row;

  const handleFilterName = useCallback(
    (event) => {
      onFilters('name', event);
    },
    [onFilters]
  );

  const confirm = useBoolean();

  const active = useBoolean();

  const { user } = useAuthContext();

  const idUser = {idUser : user?.idUsuario};

  const collapse = useBoolean();

  const { enqueueSnackbar } = useSnackbar();

  const popover = usePopover();

  const updateEstatus = useUpdate(endpoints.gestor.updateEstatusAreas);

  const [idArea, setIdArea] = useState(0);

  const [nomArea, setNomArea] = useState('');

  useEffect(() => {
  }, [idArea]);

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
        enqueueSnackbar(`Error en enviar los datos`, { variant: 'danger' });
      }

    } catch (error) {
      enqueueSnackbar(`Error en actualizar`, { variant: 'danger' });
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
          primary={area}
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
        {estatus === 1 ? (
          <IconButton
            color={collapse.value ? 'inherit' : 'default'}
            // onClick={collapse.onToggle}
            onClick={() => {
              setIdArea(id);
              setNomArea(area);
              collapse.onToggle();
              handleFilterName(area)
              if (collapse.value === true) {
                onResetFilters();
              }
            }}
            sx={{
              ...(collapse.value && {
                bgcolor: 'action.hover',
              }),
            }}
          >
            <Iconify icon="eva:arrow-ios-downward-fill" />
          </IconButton>
        ) : null
        }

        <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </TableCell>
    </TableRow>
  );

  const renderSecondary = (
    <TableRow>
      <TableCell sx={{ p: 0, border: 'none' }} colSpan={8} >
        <Collapse
          in={collapse.value}
          timeout="auto"
          unmountOnExit
          sx={{ backgroundColor: '#e4e4e4a8' }}
        >
          <Stack component={Paper} sx={{ m: 1.5 }}>

            <PuestosTable idArea={idArea} nomArea={nomArea} />

          </Stack>
        </Collapse>
      </TableCell>
    </TableRow>
  );

  return (
    <>
      {renderPrimary}

      {renderSecondary}

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
        content="¿Estás seguro de inhabilitar el área? Esto implica que todos sus puestos quedarán inhabilitados."
        action={
          <>
            <Button variant="contained" color="error" onClick={() => { confirm.onFalse() }}>
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
            <Button variant="contained" color="error" onClick={() => { active.onFalse() }}>
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

AreasTableRow.propTypes = {
  onViewRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  onFilters: PropTypes.any,
  onResetFilters: PropTypes.func,
};
