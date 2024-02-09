import * as XLSX from 'xlsx';
import { useState, useEffect, useCallback} from 'react';

import { Button } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import Container from '@mui/material/Container';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetUsers, useBatchUsers } from 'src/api/user';

import Iconify from 'src/components/iconify';
import { Upload } from 'src/components/upload';
import { useSnackbar } from 'src/components/snackbar';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import UserList from '../userList';

// ----------------------------------------------------------------------

export default function UserListView() {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();  
  
  const { data: usersData, error: usersError, usersMutate } = useGetUsers();
    
    const reader = new FileReader();
    const upload = useBoolean();
    const batchUsers = useBatchUsers();

    const [file, setFile] = useState(null);
    const [userData, setUserData] = useState([])

    useEffect(() => {
      if (!usersError && usersData) {
        const obj = usersData.map((i) => ({
          id: i.idUsuario,
          contrato: i.numContrato,
          empleado: i.numEmpleado,
          nombre: i.nombre,
          telefono: i.telPersonal,
          area: i.area,
          puesto: i.puesto,
          oficina: i.oficina,
          sede: i.sede,
          correo: i.correo,
          estatus: i.estatus,
        }));
        setUserData(obj);
      }
    }, [usersData, usersError])

    useEffect(() => {
      if (!usersError && usersData) {
        const obj = usersData.map((i) => ({
          id: i.idUsuario,
          contrato: i.numContrato,
          empleado: i.numEmpleado,
          nombre: i.nombre,
          telefono: i.telPersonal,
          area: i.area,
          puesto: i.puesto,
          oficina: i.oficina,
          sede: i.sede,
          correo: i.correo,
          estatus: i.estatus,
        }));
        setUserData(obj);
      }
    }, [usersData, usersError])

    const isExcelFile = (fileName) => {
      const boolean = /\.(xlsx|xls)$/.test(fileName);
      return boolean;
    };

    const handleDropSingleFile = useCallback((acceptedFiles) => {
      const newFile = acceptedFiles[0];
      if (newFile) {
        if (!isExcelFile(newFile.name)) {
          enqueueSnackbar('El archivo no es un archivo Excel válido', { variant: 'warning' });
          return;
        }
        setFile(
          Object.assign(newFile, {
            preview: `./assets/images/user/excel-file.png`,
          })
        );
      }
    }, [enqueueSnackbar]);

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
            { cell: worksheet.A1, keyword: 'NOMBRE' },
            { cell: worksheet.B1, keyword: 'TELÉFONO' },
            { cell: worksheet.C1, keyword: 'ÁREA' },
            { cell: worksheet.D1, keyword: 'PUESTO' },
            { cell: worksheet.E1, keyword: 'OFICINA' },
            { cell: worksheet.F1, keyword: 'SEDE' },
            { cell: worksheet.G1, keyword: 'CORREO' },
          ];
          
          let showError = requiredData.some(item => {
            if (!item.cell || !(item.cell.v === (item.keyword))) {
              enqueueSnackbar(`El título ${item.cell.v} no coincide con ${item.keyword}`, { variant: 'warning' });
              return true; // Devolvemos true para indicar que se ha encontrado un error
            }
            return false; // Devolvemos false para indicar que no hay error en este elemento
          });
          
          if (showError) {
            return;
          }
          
          showError = false;
          jsonData.forEach((row, index) => {
            const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'E'];
          
            labels.forEach(label => {
              const cellLabel = label + (index + 2);
          
              if (!worksheet[cellLabel]) {
                enqueueSnackbar(`Asegúrese de que los registros contengan información en la celda ${cellLabel}`, { variant: 'warning' });
                showError = true;
              }
            });
          });
          if (showError) {
            return;
          }

          // Transformar las claves en el objeto JSON
          const transformedData = jsonData.map((row) => ({
            nombre: row.NOMBRE,
            telPersonal: row.TELÉFONO,
            area: row.ÁREA,
            puesto: row.PUESTO,
            oficina: row.OFICINA,
            sede: row.SEDE,
            correo: row.CORREO,
            creadoPor: 1,
          }));
        
          const users = {
            "nombreTabla": "usuarios",
            "data": transformedData,
          };
          
          handleCreateUsers(users);
        };

        reader.readAsArrayBuffer(file);
    };

    const handleCreateUsers = async (users) => {
      try {
        const update = await batchUsers(JSON.stringify(users));
        if (update.result) {
          enqueueSnackbar(`¡Los usuarios han sido registrados exitosamente!`, { variant: 'success' });
          usersMutate();
        } else {
          enqueueSnackbar(`¡Ha surgido un error al intentar registrar los usuarios!`, { variant: 'warning' });
        }
      } catch (error) {
        console.error("Error en handleDeleteRow:", error);
        enqueueSnackbar(`¡No se pudó actualizar los datos de usuario!`, { variant: 'danger' });
      }
      handleCloseDialog();
    };

    const handleCloseDialog = () =>{
      upload.onFalse();
      setFile(null);
    } 

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
            {
              name: 'User',
              href: paths.dashboard.usuarios.root,
            },
            { name: 'Listado de usuarios' },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
          action={
            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:cloud-upload-fill" />}
              onClick={upload.onTrue}
            >
                Nuevos usuarios
            </Button>
          }
        />

        <UserList users={userData} usersMutate={usersMutate} />
      </Container>
      <Dialog fullWidth maxWidth="sm" open={upload.value} onClose={handleCloseDialog}>
        <DialogTitle sx={{ p: (theme) => theme.spacing(3, 3, 2, 3) }}> Agregar usuarios </DialogTitle>

        <DialogContent dividers sx={{ pt: 1, pb: 0, border: 'none' }}>
          <Upload file={file} onDrop={handleDropSingleFile} onDelete={() => setFile(null)} /> 
        </DialogContent>

        <DialogActions>
          <Button
            variant="contained"
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