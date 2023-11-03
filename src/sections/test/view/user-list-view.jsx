import * as XLSX from 'xlsx';
import { useState, useCallback } from 'react';

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
// ----------------------------------------------------------------------

export default function UserListView() {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
    
    const reader = new FileReader();
    const upload = useBoolean();

    const [file, setFile] = useState(null);
    const [rows, setRows] = useState(0);

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
            preview: URL.createObjectURL(newFile),
          })
        );
      }
    }, [enqueueSnackbar]);

    const handleUpload = () => {
        if (!file) {
            enqueueSnackbar('Seleccione un archivo!', { variant: 'warning' });
            return;
        }
        console.log(file);

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
          
          console.log(jsonData);
          setRows(jsonData);
        };

        reader.readAsArrayBuffer(file);
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
                Nuevos usuarios {rows.length}
            </Button>
          }
        />

        <UserList />
      </Container>
      <Dialog fullWidth maxWidth="sm" open={upload.value} onClose={upload.onFalse}>
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
