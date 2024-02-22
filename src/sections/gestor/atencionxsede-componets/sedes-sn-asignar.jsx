import { useState } from 'react';
import PropTypes from 'prop-types';

import Dialog from '@mui/material/Dialog';

import { useBoolean } from 'src/hooks/use-boolean';

import { useAuthContext } from 'src/auth/hooks';

import { usePopover } from 'src/components/custom-popover';

import SedeItem from './sede-item';
import BankingContacts from './banking-contacts';
import ModalAsignarSede from './modal-asignar-sede';


// ----------------------------------------------------------------------

export default function SedeSnAsignar({ onDelete, sx, modalidadesData, puestosData, sedesData, ...other }) {

  const { user } = useAuthContext();

  const modal = useBoolean();

  const popover = usePopover();

  const [sd, setSd] = useState(0);

  const [open2, setOpen2] = useState(false);

  const handleOpen = (idSede) => {
    setOpen2(true);
    setSd(idSede);
  }

  const handleClose = () => {
    setOpen2(false);
  }

  return (
    <>

      {user?.idRol === "4" || user?.idRol === 4 ? (
        <BankingContacts
          list={puestosData}
          modalidadesData={modalidadesData}
          sedesData={sedesData}
        />
      ) : (
        <>
          {sedesData.map((e, index) => (
            <SedeItem key={index} sx={sx} value={e} handleOpen={handleOpen} />
          ))}
        </>
      )}

      <Dialog
        fullWidth
        maxWidth={false}
        open={open2}
        onClose={popover.onClose}
        PaperProps={{
          sx: { maxWidth: 720 },
        }}
      >
        <ModalAsignarSede
          idSede={sd}
          idPuesto={user?.idPuesto}
          open={modal.value}
          onClose={handleClose}
          modalidadesData={modalidadesData}
        />
      </Dialog>

    </>
  );
}

SedeSnAsignar.propTypes = {
  onDelete: PropTypes.func,
  sx: PropTypes.object,
  modalidadesData: PropTypes.any,
  puestosData: PropTypes.any,
  sedesData: PropTypes.any,
};
