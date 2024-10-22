/* eslint-disable no-nested-ternary */
import { useState } from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { useBoolean } from 'src/hooks/use-boolean';

import {fechaAll} from 'src/utils/general'
import { fCurrency } from 'src/utils/format-number';

import { actualizarFondoAhorro } from 'src/api/fondoAhorro/legalario';

// import { useAuthContext } from 'src/auth/hooks';
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';


// ----------------------------------------------------------------------

const ESTATUS_FA = Object.freeze({
  SOLICITADO: 1,
  EN_PROCESO_FIRMA: 2,
  CON_FIRMA: 3,
  EN_EJECUCION: 4,
  FINALIZADO: 5,
  CANCELADO: 6,
});

export default function SolicitudesTableRow({ row, selected, mutate }) {
  const { enqueueSnackbar } = useSnackbar();
  // const { user } = useAuthContext();
  const confirm = useBoolean();
  const popover = usePopover();

  const [dialogData, setDialogData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    idFondo,
    idContrato,
    nombre_persona,
    pri_apellido,
    sec_apellido,
    fechaInicio,
    fechaFin,
    monto,
    esReinversion,
    estatusFondo,
    nombreEstatusFondo,
  } = row;

  console.log(row);

  const showConfirmDialog = (data) => {
    popover.onClose();
    setDialogData(data);
    confirm.onTrue();
  };

  const handleConfirmDialog = async () => {
    setIsLoading(true);
    if (dialogData?.type === 'cancel') {
      console.log(1);
      const cancelRes = await actualizarFondoAhorro(idFondo, ESTATUS_FA.CANCELADO);
      enqueueSnackbar(cancelRes?.msg, {
        variant: cancelRes.result ? 'success' : 'error',
      });
      setIsLoading(false);
      confirm.onFalse();
      mutate();
    } else if (dialogData?.type === 'confirm') {
      console.log(2);
      const cancelRes = await actualizarFondoAhorro(idFondo, ESTATUS_FA.CANCELADO);
      enqueueSnackbar(cancelRes?.msg, {
        variant: cancelRes.result ? 'success' : 'error',
      });
      setIsLoading(false);
      confirm.onFalse();
      mutate();
    } else {
      console.log(3);
    }
    setIsLoading(false);
  };

  const cancelDialog = () => {
    confirm.onFalse();
    setDialogData(null);
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{idFondo}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{idContrato}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {nombre_persona} {pri_apellido} {sec_apellido}
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {fechaAll(fechaInicio)}
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {fechaAll(fechaFin)}
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fCurrency(monto)}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{esReinversion === 1 ? 'SÍ' : 'NO'}</TableCell>
        <TableCell>
          <Label
            variant="soft"
            color={
                nombreEstatusFondo === 'Solicitado' ? 'primary' :
                nombreEstatusFondo === 'En proceso de firma' ? 'info' :
                nombreEstatusFondo === 'Con firma' ? 'secondary' :
                nombreEstatusFondo === 'En ejecución' ? 'success' :
                nombreEstatusFondo === 'Finalizado' ? 'default' :
                nombreEstatusFondo === 'Cancelado' ? 'error' :
                'default'
            }
          >
            {nombreEstatusFondo.toUpperCase()} 
          </Label>
        </TableCell>

        <TableCell
          align="right"
          sx={{
            px: 1,
            whiteSpace: 'nowrap',
          }}
        >
          {estatusFondo !== 6 && (
            <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          )}
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 170 }}
      >
        {estatusFondo === 3 && (
          <MenuItem
            onClick={() => {
              showConfirmDialog({
                type: 'confirm',
                msg: '¿Estás seguro de confirmar el contrato firmado?',
              });
            }}
          >
            <Iconify icon="line-md:clipboard-check" />
            Confirmar firmado
          </MenuItem>
        )}
        {estatusFondo !== 6 && (
          <MenuItem
            onClick={() => {
              showConfirmDialog({
                type: 'cancel',
                msg: '¿Estás seguro de cancelar la solicitud?',
              });
            }}
          >
            <Iconify icon="line-md:cancel" />
            Cancelar
          </MenuItem>
        )}
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={dialogData?.type === 'confirm' ? 'Confirmar contrato' : 'Cancelar solicitud'} // Título condicional basado en el tipo
        content={dialogData?.msg || ''} // Mostrar el mensaje del dialogData
        action={
          <>
            <Button variant="contained" color="error" onClick={cancelDialog}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleConfirmDialog}
              isLoading={isLoading}
            >
              Aceptar
            </Button>
          </>
        }
      />
    </>
  );
}

SolicitudesTableRow.propTypes = {
  row: PropTypes.object,
  selected: PropTypes.bool,
  mutate: PropTypes.func,
};
