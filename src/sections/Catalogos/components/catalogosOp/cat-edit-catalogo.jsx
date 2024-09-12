import PropTypes from 'prop-types';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import React, { useState, useEffect } from 'react';

import DialogActions from '@mui/material/DialogActions';
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

// eslint-disable-next-line react/prop-types
const EditarCatalogoModal = ({ open, onClose, idCatalogo, nombrecatalogo }) => {
  const { data, isError, isLoading, mutate } = useGetCatalogosOp(idCatalogo);
  const [isAgregarCatalogoOpen, setIsAgregarCatalogoOpen] = useState(false);
  const [numOpcion, setNumOpcion] = useState(0);  // Estado para contar los registros
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

  useEffect(() => {
    if (data) {
      setNumOpcion(data.length);  // Actualiza el número de registros
    }
  }, [data]);

  const handleCatalogoAdded = () => {
    // Incrementa numOpcion en 1
    setNumOpcion(prevNum => prevNum + 1);
    // Cierra el modal
    handleCloseAgregarCatalogo();
    // Actualiza los datos en la tabla
    mutate();
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
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '90vh',
          }}
        >
          <Box
            sx={{
              mb: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography id="modal-title" variant="h6" component="h2">
              Editar opciones de catálogo ({nombrecatalogo})
            </Typography>
           
          </Box>
          {isLoading && <Typography>Cargando datos...</Typography>}
          {isError && !isLoading && <Typography>Sin datos</Typography>}
          {!isLoading && !isError && (
            <Box
              sx={{
                flex: 1,
                overflow: 'auto', 
              }}
            >
              <SimpleBar style={{ maxHeight: '100%' }}>
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Opción de Catálogo</TableCell>
                        <TableCell>Estatus</TableCell>
                        <TableCell>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.map((row) => (
                        <TableRow key={row.idOpcion}>
                          <TableCell>{row.idOpcion}</TableCell>
                          <TableCell>{row.nombre}</TableCell>
                          <TableCell>{row.estatus}</TableCell>
                          <TableCell>
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
            </Box>
          )}
          <Box sx={{ mt: 2 }}>
            <DialogActions>
              <Button variant="contained" color="error" onClick={onClose}>
                Cerrar
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={handleOpenAgregarCatalogo}  
                startIcon={<Iconify icon="line-md:plus-circle-filled" sx={{ color: '#ffffff' }} />}
              >
                Agregar
              </Button>
            </DialogActions>
          </Box>
        </Box>
      </Modal>
      <AgregarCatalogoOpModal
        open={isAgregarCatalogoOpen}
        onClose={handleCloseAgregarCatalogo}
        numOpcion={numOpcion + 1}  
        idCatalogo={idCatalogo}
        onCatalogoAdded={handleCatalogoAdded}  
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