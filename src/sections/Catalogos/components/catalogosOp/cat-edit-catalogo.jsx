import PropTypes from 'prop-types';
import React, { useState } from 'react';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

import TableContainer from '@mui/material/TableContainer';
import {
  Box,
  Modal,
  Table,
  Paper,
  Button,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  IconButton
} from '@mui/material';

import { useAuthContext } from 'src/auth/hooks'; 
import { useGetCatalogosOp, updateStatusCatalogoOp } from 'src/api/catalogos/catalogos'; 

import Iconify from 'src/components/iconify';

import AgregarCatalogoOpModal from './modal-add-catalogoOp';

const EditarCatalogoModal = ({ open, onClose, idCatalogo }) => {
  const { data, isError, isLoading, mutate } = useGetCatalogosOp(idCatalogo);
  const [isAgregarCatalogoOpen, setIsAgregarCatalogoOpen] = useState(false);
  const { user: datosUser } = useAuthContext(); 

  const handleOpenAgregarCatalogo = () => {
    setIsAgregarCatalogoOpen(true);
  };

  const handleCloseAgregarCatalogo = () => {
    setIsAgregarCatalogoOpen(false);
  };

  const toggleEstatus = async (idOpcion, currentStatus) => {
    const estatusOp = currentStatus === 'Activo' ? 'Inactivo' : 'Activo'; 
    try {
      await updateStatusCatalogoOp(idOpcion, idCatalogo, estatusOp, datosUser.idUsuario); 
      mutate(); 
    } catch (error) {
      console.error('Error al actualizar el estatus', error);
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            width: '90%',
            maxWidth: 600,
            bgcolor: 'background.paper',
            p: 4,
            borderRadius: 5,
            boxShadow: 20,
            overflow: 'auto',
            maxHeight: '90vh',
          }}
        >
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography id="modal-title" variant="h6" component="h2">
              Editar Opciones Catálogo
            </Typography>
            <Box>
              <Button
                variant="contained"
                sx={{ 
                  mr: 1, 
                  color: '#ffffff', 
                  backgroundColor: '#140a10', 
                  '&:hover': {
                    backgroundColor: '#22c55e' 
                  }
                }}
                onClick={handleOpenAgregarCatalogo}
                startIcon={<Iconify icon="line-md:plus-circle-filled" sx={{ color: '#ffffff' }} />}
              >
                Agregar
              </Button>
              <IconButton onClick={onClose} color="primary">
                <Iconify icon="eva:close-fill" />
              </IconButton>
            </Box>
          </Box>

          {isLoading && <Typography>Cargando datos...</Typography>}
          {isError && !isLoading && <Typography>Sin datos</Typography>}
          {!isLoading && !isError && (
            <SimpleBar style={{ maxHeight: 400 }}>
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Opción de Catálogo</TableCell>
                      <TableCell>Estatus</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.map((row) => (
                      <TableRow key={row.idOpcion}>
                        <TableCell>{row.idOpcion}</TableCell>
                        <TableCell>{row.nombre}</TableCell>
                        <TableCell>
                          {row.estatus}
                          <IconButton
                            onClick={() => toggleEstatus(row.idOpcion, row.estatus)} 
                            color="primary"
                            sx={{ ml: 2 }}
                          >
                            <Iconify 
                              icon={row.estatus === 'Activo' ? 'mdi:toggle-switch-off' : 'mdi:toggle-switch'} 
                              sx={{ color: row.estatus === 'Activo' ? 'green' : 'red' }}
                            />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </SimpleBar>
          )}
        </Box>
      </Modal>
      <AgregarCatalogoOpModal
        open={isAgregarCatalogoOpen}
        onClose={handleCloseAgregarCatalogo}
        onCatalogoAdded={() => {}}
        idCatalogo={idCatalogo}
      />
    </>
  );
};

EditarCatalogoModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  idCatalogo: PropTypes.number.isRequired,
};

export default EditarCatalogoModal;


