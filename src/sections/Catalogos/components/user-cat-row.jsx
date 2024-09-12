// src/components/catalogosOp/user-cat-row.js
import { useState } from 'react';
import PropTypes from 'prop-types';

import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import EditarEstatus from './modal-editar-catalogo';
import EditarCatalogoModal from './catalogosOp/cat-edit-catalogo';

export default function CatalogoRow({ row, onDeleteRow, onEditRow }) {
  const { idCatalogo, nombre, estatus } = row;
  const popover = usePopover();

  const [openEditStatus, setOpenEditStatus] = useState(false);
  const [openEditCatalogo, setOpenEditCatalogo] = useState(false);

  const handleOpenEditStatus = () => {
    setOpenEditStatus(true);
    popover.onClose();
  };

  const handleCloseEditStatus = () => {
    setOpenEditStatus(false);
  };

  const handleOpenEditCatalogo = () => {
    setOpenEditCatalogo(true);
    popover.onClose();
  };

  const handleCloseEditCatalogo = () => {
    setOpenEditCatalogo(false);
  };

  return (
    <>
      <TableRow>
        <TableCell>{idCatalogo}</TableCell>
        <TableCell>{nombre}</TableCell>
        <TableCell>{estatus}</TableCell>
        <TableCell align="right">
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 170 }}
      >
        <MenuItem onClick={handleOpenEditStatus}>
          <Iconify icon="line-md:pencil-twotone" />
          Cambiar Estatus
        </MenuItem>
        <MenuItem onClick={handleOpenEditCatalogo}>
          <Iconify icon="line-md:check-list-3" />
          Editar Catálogo
        </MenuItem>
      </CustomPopover>

      {openEditStatus && (
        <EditarEstatus
          open={openEditStatus}
          onClose={handleCloseEditStatus}
          idCatalogo={idCatalogo}
          estatusVal={estatus}
        />
      )}

      {openEditCatalogo && (
        <EditarCatalogoModal
          open={openEditCatalogo}
          idCatalogo={idCatalogo}
          onClose={handleCloseEditCatalogo}
        />
      )}
    </>
  );
}

CatalogoRow.propTypes = {
  row: PropTypes.object.isRequired,
  onDeleteRow: PropTypes.func.isRequired,
  onEditRow: PropTypes.func.isRequired,
};
