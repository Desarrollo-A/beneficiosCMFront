import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { updateUser } from 'src/api/user';
import { useAuthContext } from 'src/auth/hooks';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------
export default function UserQuickEditForm({
  currentUser,
  open,
  onClose,
  areasMutate,
  usersMutate,
  popoverOnClose,
}) {
  const { enqueueSnackbar } = useSnackbar();
  const { user: datosUser } = useAuthContext();

  const NewUserSchema = Yup.object().shape({
    id: Yup.string().required('Este campo es requerido'),
    nombre: Yup.string()
      .required('Este campo es requerido')
      .min(5, 'El nombre debe tener al menos 10 caracteres'),
    telefono: Yup.string()
      .matches(/^[0-9]{10}$/, {
        message: 'El número telefónico debe contener 10 dígitos numéricos',
        excludeEmptyString: true,
      }) // Validar exactamente 10 dígitos numéricos
      .notRequired(), // Hacer el campo opcional
    correo: Yup.string()
      .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
        message: 'El correo debe ser una dirección de correo válida',
        excludeEmptyString: true,
      })
      .notRequired(), // Validar el formato del correo electrónico
    sexo: Yup.string().required('Este campo es requerido'),
    estatus: Yup.string().required('Este campo es requerido'),
  });

  const defaultValues = useMemo(
    () => ({
      id: currentUser?.id || '',
      contrato: currentUser?.contrato || '',
      empleado: currentUser?.empleado || '',
      nombre: currentUser?.nombre || '',
      sexo: currentUser?.sexo || '',
      telefono: currentUser?.telefono || '',
      correo: currentUser?.correo || '',
      estatus: currentUser?.estatus || 0,
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

  useEffect(() => {
    reset(defaultValues); // defaultValues debería ser actualizado cuando cambia el usuario
  }, [currentUser, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const updateData = {
        nombre: data.nombre.toUpperCase(),
        telPersonal: data.telefono,
        correo: data.correo.toLowerCase(),
        sexo: data.sexo,
        modificadoPor: datosUser.idUsuario,
        estatus: data.estatus,
      };

      const update = await updateUser(data.id, updateData); // Id del usuario a actualizar y su data.

      if (update.result) {
        enqueueSnackbar(`¡Se ha actualizado los datos del usuario exitosamente!`, {
          variant: 'success',
        });
      } else {
        enqueueSnackbar(`¡No se pudo actualizar los datos de usuario!`, { variant: 'warning' });
      }

      reset();
      onClose();
      usersMutate();
      areasMutate();
      popoverOnClose();
    } catch (error) {
      reset();
      onClose();
      popoverOnClose();
      enqueueSnackbar(`¡No se pudo actualizar los datos de usuario!`, { variant: 'error' });
      console.error('Error', error);
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
        <DialogTitle>Edición de registro</DialogTitle>

        <DialogContent>
          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
            }}
            sx={{ mt: 2 }}
          >
            <RHFTextField name="id" label="ID" defaultValue={currentUser.id} disabled />
            <RHFSelect
              name="estatus"
              label="Estatus"
              defaultValue={currentUser && currentUser.estatus === 1 ? 1 : 0}
            >
              <MenuItem name="estatus" key={0} value={0}>
                INACTIVO
              </MenuItem>
              <MenuItem name="estatus" key={1} value={1}>
                ACTIVO
              </MenuItem>
            </RHFSelect>

            {/* <Box sx={{ display: { xs: 'none', sm: 'block' } }} /> */}

            <RHFTextField name="nombre" label="Nombre" defaultValue={currentUser.nombre} />
            <RHFSelect
              name="sexo"
              label="Sexo"
              defaultValue={currentUser && currentUser.estatus === 1 ? 1 : 0}
            >
              <MenuItem name="estatus" key="M" value="M">
                Masculino
              </MenuItem>
              <MenuItem name="estatus" key="F" value="F">
                Femenino
              </MenuItem>
            </RHFSelect>
            <RHFTextField
              name="contrato"
              label="Contrato"
              defaultValue={currentUser.contrato}
              disabled
            />
            <RHFTextField
              name="empleado"
              label="Empleado"
              defaultValue={currentUser.empleado}
              disabled
            />
            <RHFTextField name="telefono" label="Teléfono" defaultValue={currentUser.telefono} />
            <RHFTextField
              name="correo"
              type="email"
              label="Correo"
              defaultValue={currentUser.correo}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              onClose();
              popoverOnClose();
              reset();
            }}
          >
            Cerrar
          </Button>

          <LoadingButton type="submit" variant="contained" color="success" loading={isSubmitting}>
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
  areasMutate: PropTypes.func,
  usersMutate: PropTypes.func,
  popoverOnClose: PropTypes.func,
};
