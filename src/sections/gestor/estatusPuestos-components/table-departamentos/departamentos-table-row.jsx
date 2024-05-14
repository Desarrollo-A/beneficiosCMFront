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

import AreasTable from '../table-areas/areas-table';


// ----------------------------------------------------------------------

export default function TableDepartamentos({ row, selected, onViewRow, onDeleteRow, onFilters, onResetFilters }) {
  const { id, departamento, estatus } = row;

  const handleFilterName = useCallback(
    (event) => {
      onFilters('name', event);
    },
    [onFilters]
  );

  const confirm = useBoolean();

  const active = useBoolean();

  const { user } = useAuthContext();

  const idUser = {idUser : user.idUsuario};

  const updateEstatus = useUpdate(endpoints.gestor.updateEstatusDepartamentos);

  const { enqueueSnackbar } = useSnackbar();

  const collapse = useBoolean();

  const popover = usePopover();

  const [idDepa, setIdDepa] = useState(0);

  const [nomDepa, setNomDepa] = useState('');

  useEffect(() => {
  }, [idDepa]);

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
            primary={departamento}
            /* secondary={customer.email} */
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
                setIdDepa(id);
                setNomDepa(departamento);
                handleFilterName(departamento)
                collapse.onToggle();
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

            <AreasTable idDepa={idDepa} nomDepa={nomDepa} />

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
        content="¿Estás seguro de inhabilitar el departamento? Esto implica que todas sus áreas y puestos quedarán inhabilitados."
        action={
          <>
            <Button variant="contained" color="success" /* onClick={onDeleteRow} */>
              Aceptar
            </Button>
            <Button variant="contained" color="error" onClick={onDeleteRow}>
              Cancelar
            </Button>
          </>
        }
      />

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Inhabilitar"
        content="¿Estás seguro de inhabilitar el departamento? Esto implica que todos sus puestos quedarán inhabilitados."
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

TableDepartamentos.propTypes = {
  onDeleteRow: PropTypes.func,
  onViewRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  onFilters: PropTypes.any,
  onResetFilters: PropTypes.func,
};
