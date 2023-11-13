import * as Yup from 'yup';
import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function UserQuickEditForm({ currentUser, open, onClose }) {
  const { enqueueSnackbar } = useSnackbar();

  const NewUserSchema = Yup.object().shape({
    id: Yup.string().required('N. Contrato es requerido'),
    contrato: Yup.string().required('N. Contrato es requerido'),
    empleado: Yup.string().required('N. Empleado es requerido'),
    nombre: Yup.string().required('Nombre es requerido'),
    telefono: Yup.string().required('El N. Teléfonico es requerido'),
    area: Yup.string().required('Área es requerido'),
    puesto: Yup.string().required('El puesto es requerido'),
    oficina: Yup.string().required('El campo de oficina es requerido'),
    sede: Yup.string().required('La sede es requerida'),
    correo: Yup.string().required('El correo es requerido').email('El correo debe ser una dirección de correo valida'),
    estatus: Yup.string().required('El estatus es necesario'),
  });

  const defaultValues = useMemo(
    () => ({
      id: currentUser?.id || '',
      contrato: currentUser?.contrato || '',
      empleado: currentUser?.empleado || '',
      nombre: currentUser?.nombre || '',
      telefono: currentUser?.telefono || '',
      area: currentUser?.area || '',
      puesto: currentUser?.puesto || '',
      oficina: currentUser?.oficina || '',
      sede: currentUser?.sede || '',
      correo: currentUser?.correo || '',
      estatus: currentUser?.estatus || '',
    }),
    [currentUser]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const response = await fetch('http://localhost/beneficiosCMBack/Usuario/updateUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'idUsuario': data.id,
          'numContrato': data.contrato,
          'numEmpleado': data.empleado,
          'nombre': data.nombre,
          'telPersonal': data.telefono,
          'area': data.area,
          'puesto': data.puesto,
          'oficina': data.oficina,
          'sede': data.sede,
          'correo': data.correo,
          'estatus': data.estatus,
        }),
      });
  
      const res = await response.json();
      if (res.result) {
        reset();
        onClose();
        enqueueSnackbar(`¡Se ha actualizado los datos del usuario exitosamente!`, { variant: 'success' });
      } else {
        reset();
        onClose();
        enqueueSnackbar(`¡No se pudó actualizar los datos de usuario!`, { variant: 'warning' });
      }
    } catch (error) {
      reset();
      onClose();
      enqueueSnackbar(`¡No se pudó actualizar los datos de usuario!`, { variant: 'danger' });
    }
  });

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { maxWidth: 720 },
      }}
    >
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Edicion de registro</DialogTitle>

        <DialogContent>

          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
            }}
            sx={{mt:2}}
          >
            <RHFSelect name="estatus" label="Estatus" defaultValue={currentUser ? 1 : 0} >
              <MenuItem key={1} value={1}>
                ACTIVO
              </MenuItem>
              <MenuItem key={0} value={0}>
                INACTIVO
              </MenuItem>
            </RHFSelect>

            <Box sx={{ display: { xs: 'none', sm: 'block' } }} />

            <RHFTextField name="id" label="ID" defaultValue={currentUser.id} />
            <RHFTextField name="nombre" label='Nombre' defaultValue={currentUser.nombre}/>
            <RHFTextField name="contrato" label="Contrato" defaultValue={currentUser.contrato}/>
            <RHFTextField name="empleado" label="Empleado" defaultValue={currentUser.empleado}/>
            <RHFTextField name="Telefono" label="Telefono" defaultValue={currentUser.telefono}/>
            <RHFTextField name="area" label="Area" defaultValue={currentUser.area}/>
            <RHFTextField name="puesto" label="Puesto" defaultValue={currentUser.puesto}/>
            <RHFTextField name="oficina" label="Oficina" defaultValue={currentUser.oficina}/>
            <RHFTextField name="sede" label="Sede" defaultValue={currentUser.sede}/>
            <RHFTextField name="correo" type="email" label="Correo" defaultValue={currentUser.correo}/>
          </Box>

        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Actualizar
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

UserQuickEditForm.propTypes = {
  currentUser: PropTypes.object,
  onClose: PropTypes.func,
  open: PropTypes.bool,
};
