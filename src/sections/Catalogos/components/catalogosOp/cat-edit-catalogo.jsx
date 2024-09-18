import PropTypes from 'prop-types';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import React, { useState, useEffect } from 'react';

import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';
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

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';

import AgregarCatalogoOpModal from './modal-add-catalogoOp';

// eslint-disable-next-line react/prop-types
const EditarCatalogoModal = ({ open, onClose, idCatalogo, nombrecatalogo }) => {
  const { data, isError, isLoading, mutate } = useGetCatalogosOp(idCatalogo);
  const [isAgregarCatalogoOpen, setIsAgregarCatalogoOpen] = useState(false);
  const [numOpcion, setNumOpcion] = useState(0); 
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
      setNumOpcion(data.length);  
    }
  }, [data]);

  const handleCatalogoAdded = () => {
    setNumOpcion(prevNum => prevNum + 1);
    handleCloseAgregarCatalogo();
    mutate();
  };

  const dataFiltered = data || [];
  const notFound = !dataFiltered.length;

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
  
          {notFound ? (
            <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%', 
              minHeight: 200,
            }}
          >
         <CircularProgress size={45} />
            <Typography variant="h6" color="textSecondary">
              Aún no hay datos para mostrar
            </Typography>
            </Box>
          ) : (
            !isLoading &&
            !isError && (
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
                        {dataFiltered.map((row) => (
                          <TableRow key={row.idOpcion}>
                            <TableCell>{row.idOpcion}</TableCell>
                            <TableCell>{row.nombre.toUpperCase()}</TableCell>
                            <TableCell>
                              <Label
                                variant="soft"
                                color={row.estatus === 'Activo' ? 'success' : 'error'}
                              >
                                {row.estatus === 'Activo' ? 'ACTIVO' : 'INACTIVO'}
                              </Label>
                            </TableCell>
                            <TableCell>
                              <IconButton
                                onClick={() => toggleEstatus(row.idOpcion, row.estatus)} 
                                color="primary"
                                sx={{ ml: 2, transform: 'scale(1.5)' }}  // aumentar boton
                              >
                                <Iconify 
                                  icon={row.estatus === 'Activo' ? 'mdi:toggle-switch-off' : 'mdi:toggle-switch'} 
                                  sx={{ 
                                    color: row.estatus === 'Activo' ? '#BAA36B' : '#a9a9a9',
                                    fontSize: '2rem'
                                  }}
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
            )
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