import { useState } from 'react';
import PropTypes from 'prop-types';

/* import Box from '@mui/material/Box'; */
import Table from '@mui/material/Table';
/* import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper'; */
import Select from '@mui/material/Select';
import TableRow from '@mui/material/TableRow';
/* import Collapse from '@mui/material/Collapse'; */
import MenuItem from '@mui/material/MenuItem';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import { alpha, useTheme } from '@mui/material/styles';
/* import FormHelperText from '@mui/material/FormHelperText'; */
import TableContainer from '@mui/material/TableContainer';
/* 
import { useBoolean } from 'src/hooks/use-boolean'; */

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

// ----------------------------------------------------------------------

export default function CollapsibleTable() {
  const [atentions, setAtentions] = useState([
    {
      id_sede: 1,
      sede: 'Querétaro',
      abreviatura: 'QRO',
      atenciones: [],
    },
    {
      id_sede: 2,
      sede: 'San Luis Potosí',
      abreviatura: 'SLP',
      atenciones: [],
    },
    {
      id_sede: 3,
      sede: 'León',
      abreviatura: 'LEON',
      atenciones: [],
    },
    {
      id_sede: 4,
      sede: 'Ciudad de México',
      abreviatura: 'CDMX',
      atenciones: [],
    },
  ]);
  // console.log('Atenciones: ', atentions);

  // Función para editar una atención
  const handleEditAtention = (id_sede, idatencion, newAtencion) => {
    setAtentions((prevAtentions) =>
      prevAtentions.map((sede) =>
        sede.id_sede === id_sede
          ? {
              ...sede,
              atenciones: sede.atenciones.map((atencion) =>
                atencion.idatencion === idatencion ? newAtencion : atencion
              ),
            }
          : sede
      )
    );
  };

  // Función para eliminar una atención
  const handleDeleteAtention = (id_sede, indiceAtencion) => {
    const nuevoArreglo = [...atentions];

    // Encuentra el objeto con el id_sede especificado
    const objetoSede = nuevoArreglo.find((objeto) => objeto.id_sede === id_sede);

    // Elimina el elemento en el índice especificado del array de "atenciones"
    if (objetoSede) objetoSede.atenciones.splice(indiceAtencion, 1);

    setAtentions(nuevoArreglo);
  };

  // Función para añadir una atención
  const handleAddAtencion = (id_sede, newAtencion) => {
    console.log(id_sede, newAtencion);
    setAtentions((prevAtentions) =>
      prevAtentions.map((sede) =>
        sede.id_sede === id_sede
          ? {
              ...sede,
              atenciones: [...sede.atenciones, newAtencion],
            }
          : sede
      )
    );
  };

  return (
    <TableContainer sx={{ mt: 3, overflow: 'unset' }}>
      <Scrollbar>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>SEDE</TableCell>
              <TableCell align="left">ABREVIATURA</TableCell>
              <TableCell>ACCIONES</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>

          <TableBody>
            {atentions.map((row) => (
              <CollapsibleTableRow
                key={row.id_sede}
                row={row}
                edit={handleEditAtention}
                deletee={handleDeleteAtention}
                add={handleAddAtencion}
              />
            ))}
          </TableBody>
        </Table>
      </Scrollbar>
    </TableContainer>
  );
}

// ----------------------------------------------------------------------

function CollapsibleTableRow({ row, edit, deletee, add }) {
  /* const [expandCount, setExpandCount] = useState(0);
  const [rows, setRows] = useState(0);
  const collapsible = useBoolean(); */
  const theme = useTheme();

  /* const handleExpand = () => {
    setExpandCount((prevCount) => prevCount + 1);
  }; */

  const pushRow = (data) => {
    const newRow = {
      especialista: 8,
      modalidad: 2,
      oficina: 50,
      area: 25,
    };

    add(row.id_sede, newRow);
  };

  return (
    <>
      <TableRow>
        <TableCell>{row.id_sede}</TableCell>

        <TableCell>{row.sede}</TableCell>

        <TableCell>{row.abreviatura}</TableCell>

        <TableCell>ELIMINAR</TableCell>

        <TableCell>
          <IconButton
            size="small"
            color={row.atenciones.length > 0 ? 'inherit' : 'default'}
            onClick={pushRow}
          >
            <Iconify
              icon={
                row.atenciones.length > 0
                  ? 'eva:arrow-ios-upward-fill'
                  : 'eva:arrow-ios-downward-fill'
              }
            />
          </IconButton>
        </TableCell>
      </TableRow>

      {row.atenciones.map((item, index) => (
        <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.03) }}>
          <TableCell sx={{ p: 0.05, margin: 0, paddingBottom: 0.01 }}>
            <Typography variant="subtitle" sx={{ m: 2, mt: 0 }} onClick={() => console.log(1)}>
              .
            </Typography>
          </TableCell>
          <TableCell colSpan={1}>
            <FormControl fullWidth>
              <InputLabel size="small" id="modalidad-input">
                Modalidad
              </InputLabel>
              <Select
                labelId="Modalidad"
                id="select-modalidad"
                label="Modalidad"
                name="Modalidad"
                defaultValue=""
                size="small"
                // value={selectedValues.modalidad}
                onChange={(e) => console.log(1) /* handleChange('modalidad', e.target.value) */}
              >
                {[{ tipoCita: 1, modalidad: 'En linea' }]?.map((e, i) => (
                  <MenuItem key={e.tipoCita} value={e.tipoCita}>
                    {e.modalidad.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </TableCell>
          <TableCell colSpan={1}>
            <FormControl fullWidth>
              <InputLabel size="small" id="modalidad-input">
                Oficina
              </InputLabel>
              <Select
                labelId="Modalidad"
                id="select-modalidad"
                label="Modalidad"
                name="Modalidad"
                defaultValue=""
                size="small"
                // value={selectedValues.modalidad}
                onChange={(e) => console.log(1) /* handleChange('modalidad', e.target.value) */}
              >
                {[{ tipoCita: 1, modalidad: 'En linea' }]?.map((e, i) => (
                  <MenuItem key={e.tipoCita} value={e.tipoCita}>
                    {e.modalidad.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </TableCell>
          <TableCell colSpan={1}>
            <FormControl fullWidth>
              <InputLabel size="small" id="modalidad-input">
                Area
              </InputLabel>
              <Select
                labelId="Modalidad"
                id="select-modalidad"
                label="Modalidad"
                name="Modalidad"
                defaultValue=""
                size="small"
                // value={selectedValues.modalidad}
                onChange={(e) => console.log(1) /* handleChange('modalidad', e.target.value) */}
              >
                {[{ tipoCita: 1, modalidad: 'En linea' }]?.map((e, i) => (
                  <MenuItem key={e.tipoCita} value={e.tipoCita}>
                    {e.modalidad.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </TableCell>
          <TableCell colSpan={1}>
            <IconButton size="small" onClick={() => deletee(row.id_sede, index)}>
              <Iconify icon="iconoir:cancel" color="default" />
            </IconButton>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

CollapsibleTableRow.propTypes = {
  row: PropTypes.object,
  edit: PropTypes.func,
  deletee: PropTypes.func,
  add: PropTypes.func,
};
