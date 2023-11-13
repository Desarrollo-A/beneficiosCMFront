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

import Iconify from 'src/components/iconify';
import { Upload } from 'src/components/upload';
import { useSnackbar } from 'src/components/snackbar';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import UserList from '../userList';

const BACK = 'http://localhost/beneficiosCMBack/';
// ----------------------------------------------------------------------

export default function UserListView() {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
    
    const reader = new FileReader();
    const upload = useBoolean();

    const [file, setFile] = useState(null);
    const [userData, setUserData] = useState([])

    useEffect(() => {
      loadUsers();
    }, []);

    const loadUsers = async () => {
      await fetch(`${BACK}/Usuario/getUsers`)
      .then((res) => res.json())
      .then((data) => {
        const obj = data.data.map((i) => ({
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
      })
      .catch((error) => {
        alert(error);
      });
    }

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
            preview: `${BACK}/assets/images/user/excel-file.png`,
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
            { cell: worksheet.A1, keyword: 'CONTRATO' },
            { cell: worksheet.B1, keyword: 'EMPLEADO' },
            { cell: worksheet.C1, keyword: 'NOMBRE' },
            { cell: worksheet.D1, keyword: 'TELEFONO' },
            { cell: worksheet.E1, keyword: 'AREA' },
            { cell: worksheet.F1, keyword: 'OFICINA' },
            { cell: worksheet.G1, keyword: 'SEDE' },
            { cell: worksheet.H1, keyword: 'CORREO' },
          ];
          
          let showError = false;
          
          requiredData.forEach(item => {
            if (!item.cell || (!item.cell.v.includes(item.keyword))) {
              enqueueSnackbar(`El titulo ${item.cell.v} no coincide con ${item.keyword}`, { variant: 'warning' });
              showError = true;
            }
          });
     
          if (showError) {
            return;
          }
          
          showError = false;
          jsonData.forEach((row, index) => {
            const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
          
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
          if ( !worksheet.A2 || !worksheet.B2 || !worksheet.C2 || !worksheet.D2 || !worksheet.E2 || !worksheet.F2) {
            enqueueSnackbar(`Asegurese de que los registros contengan información`, { variant: 'warning' });
            return;
          }

          // Transformar las claves en el objeto JSON
          const transformedData = jsonData.map((row) => ({
            contrato: row.CONTRATO,
            empleado: row.EMPLEADO,
            nombre: row.NOMBRE, // Cambiar "nombre" a "nombre_usuario"
            telPersonal: row.TELEFONO,
            area: row.AREA,
            oficina: row.OFICINA,
            sede: row.SEDE,
            correo: row.CORREO,
          }));
        
          const users = {
            "nombreTabla": "usuarios",
            "data": transformedData,
          };
          
          handleCreateUser(users);
        };

        reader.readAsArrayBuffer(file);
    };

    const handleCreateUser = async (users) => {
      console.log(users);
      await fetch('http://localhost/beneficiosCMBack/general/insertBatch', {
        method: 'POST',
        body: JSON.stringify(users),
      })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
          if (data.result) {
            enqueueSnackbar(`¡Los usuarios han sido registrados exitosamente!`, { variant: 'success' });
            loadUsers();
            // Aqui quiero volver a ejecutar el fetch para actualizar userData
          } else {
            enqueueSnackbar(`¡Ha surgido un error al intentar registrar los usuarios!`, { variant: 'warning' });
          }
        })
      .catch((error) => {
          enqueueSnackbar(`¡Ha surgido un error al intentar registrar los usuarios!`, { variant: 'danger' });
          console.error(error);
        }
      );
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
              name: 'Test',
              href: paths.dashboard.test.root,
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

        <UserList users={userData} updateData={loadUsers}/>
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