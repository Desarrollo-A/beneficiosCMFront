import * as XLSX from 'xlsx';
import { useState, useEffect, useCallback } from 'react';

import { Button } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import Container from '@mui/material/Container';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';

import { useAuthContext } from 'src/auth/hooks';
import { batchUsers, useGetUsers } from 'src/api/user';

import Iconify from 'src/components/iconify';
import { Upload } from 'src/components/upload';
import { useSnackbar } from 'src/components/snackbar';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import UserList from '../userList';
import { validarCorreo, validarTelefono } from '../../../utils/general';

// ----------------------------------------------------------------------

export default function UserListView() {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const { user: datosUser } = useAuthContext();

  const { data: usersData, usersMutate } = useGetUsers();

  const reader = new FileReader();
  const upload = useBoolean();

  const [file, setFile] = useState(null);
  const [userData, setUserData] = useState([]);

  useEffect(() => {
    if (usersData) {
      const obj = usersData.map((i) => ({
        id: i.idUsuario,
        contrato: i.numContrato,
        empleado: i.numEmpleado,
        nombre: i.nombre,
        telefono: i.telPersonal,
        correo: i.correo,
        sexo: i.sexo,
        estatus: i.estatus,
      }));
      setUserData(obj);
    }
  }, [usersData]);

  const isExcelFile = (fileName) => {
    const boolean = /\.(xlsx|xls)$/.test(fileName);
    return boolean;
  };

  const handleDropSingleFile = useCallback(
    (acceptedFiles) => {
      const newFile = acceptedFiles[0];
      if (newFile) {
        if (!isExcelFile(newFile.name)) {
          enqueueSnackbar('El archivo no tiene un formato válido', { variant: 'warning' });
          return;
        }
        setFile(
          Object.assign(newFile, {
            preview: `./assets/images/user/excel-file.png`,
          })
        );
      }
    },
    [enqueueSnackbar]
  );

  const handleUpload = () => {
    if (!file) {
      enqueueSnackbar('Seleccione un archivo!', { variant: 'warning' });
      return;
    }

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      // Convierte la hoja en un objeto JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      if (jsonData.length === 0) {
        enqueueSnackbar('El archivo Excel no contiene información', { variant: 'warning' });
        return;
      }

      const requiredData = [
        { cell: worksheet.A1, keyword: 'NOMBRE COMPLETO', mandatory: true },
        { cell: worksheet.B1, keyword: 'TELÉFONO PERSONAL', mandatory: false },
        { cell: worksheet.C1, keyword: 'CORREO ELECTRÓNICO', mandatory: false },
        { cell: worksheet.D1, keyword: 'SEXO', mandatory: true },
      ];

      let showError = requiredData.some((item) => {
        if (!item.cell || !(item.cell.v === item.keyword)) {
          enqueueSnackbar(`El título ${item.cell.v} no coincide con ${item.keyword}`, {
            variant: 'warning',
          });

          return true; // Devolvemos true para indicar que se ha encontrado un error
        }
        return false; // Devolvemos false para indicar que no hay error en este elemento
      });

      if (showError) {
        return;
      }

      showError = false;
      const labels = ['A', 'B', 'C', 'D'];

      jsonData.forEach((row, index) => {
        labels.forEach((label, index2) => {
          const cellLabel = label + (index + 2); // A2 Y asi

          const cellValue = row[requiredData[index2].keyword];

          if (cellValue === undefined && requiredData[index2].mandatory) {
            enqueueSnackbar(`Asegúrese de que contenga información en la celda ${cellLabel}`, {
              variant: 'warning',
            });
            showError = true;
          } else if (label === 'A' && cellValue.length < 10) {
            enqueueSnackbar(`El nombre tiene una longitud minima en la celda ${cellLabel}`, {
              variant: 'warning',
            });
            showError = true;
          } else if (label === 'B' && cellValue !== undefined) {
            const isTelephoneNumberValid = validarTelefono(cellValue.toString());
            if (!isTelephoneNumberValid) {
              enqueueSnackbar(
                `El número teléfonico tiene un formato incorrecto en la celda ${cellLabel}`,
                { variant: 'warning' }
              );
              showError = true;
            }
          } else if (label === 'C' && cellValue !== undefined) {
            const isEmailValid = validarCorreo(cellValue);
            if (!isEmailValid) {
              enqueueSnackbar(
                `El correo electrónico tiene un formato incorrecto en la celda ${cellLabel}`,
                { variant: 'warning' }
              );
              showError = true;
            }
          } else if (label === 'D' && !['F', 'M', 'f', 'm'].includes(cellValue)) {
            enqueueSnackbar(
              `El correo electrónico tiene un formato incorrecto en la celda ${cellLabel}`,
              { variant: 'warning' }
            );
            showError = true;
          }
        });
      });

      if (showError) {
        handleCloseDialog();
        return;
      }

      // enqueueSnackbar(`Todo bien`, { variant: 'success' });

      // Transformar las claves en el objeto JSON
      const transformedData = jsonData.map((row) => ({
        nombre: row['NOMBRE COMPLETO'].toUpperCase(),
        telPersonal: row['TELÉFONO PERSONAL'] ? row['TELÉFONO PERSONAL'] : '',
        correo: row['CORREO ELECTRÓNICO'] ? row['CORREO ELECTRÓNICO'].toLowerCase() : '',
        sexo: row.SEXO.toUpperCase(),
        creadoPor: datosUser.idUsuario,
      }));

      const users = {
        nombreTabla: 'usuarios',
        data: transformedData,
      };

      handleCreateUsers(users);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleCreateUsers = async (users) => {
    try {
      const update = await batchUsers(users.nombreTabla, users.data);
      if (update.result) {
        enqueueSnackbar(`¡Los usuarios han sido registrados exitosamente!`, { variant: 'success' });
        usersMutate();
      } else {
        enqueueSnackbar(`¡Ha surgido un error al intentar registrar los usuarios!`, {
          variant: 'warning',
        });
      }
    } catch (error) {
      console.error('Error en handleCreateUsers:', error);
      enqueueSnackbar(`¡No se pudo actualizar los datos de usuario!`, { variant: 'error' });
    }
    handleCloseDialog();
  };

  const handleCloseDialog = () => {
    upload.onFalse();
    setFile(null);
  };

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Listado de usuarios"
          links={[
            {
              name: 'Dashboard',
              href: paths.dashboard.root,
            },
            { name: 'Listado de usuarios externos' },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
          action={
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<Iconify icon="eva:cloud-upload-fill" />}
              onClick={upload.onTrue}
            >
              Nuevos usuarios
            </Button>
          }
        />

        <UserList userData={userData} usersMutate={usersMutate} />
      </Container>
      <Dialog fullWidth maxWidth="sm" open={upload.value} onClose={handleCloseDialog}>
        <DialogTitle sx={{ p: (theme) => theme.spacing(3, 3, 2, 3) }}>Agregar usuarios</DialogTitle>

        <DialogContent dividers sx={{ pt: 1, pb: 0, border: 'none' }}>
          <Upload
            file={file}
            onDrop={handleDropSingleFile}
            onDelete={() => setFile(null)}
            accept={{
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [],
              'application/vnd.ms-excel': [],
            }}
          />
        </DialogContent>

        <DialogActions>
          <Button
            variant="contained"
            color="error"
            startIcon={<Iconify icon="eva:cloud-upload-fill" />}
            onClick={handleCloseDialog}
          >
            Cerrar
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<Iconify icon="eva:cloud-upload-fill" />}
            onClick={handleUpload}
          >
            Subir
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
