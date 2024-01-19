import { Helmet } from 'react-helmet-async';

import { OverviewAppView } from 'src/sections/overview/app/view';
import PendingModal from 'src/sections/overview/calendario/view/pendingModal';

// ----------------------------------------------------------------------

export default function OverviewAppPage() {

  const handleClose2 = () => {
    setOpen2(false);
    setReason([]);
    setCancelType('');
  };

  function handleEnd(event) {
    setOpen2(true);
    setSelectEvent(event);
  }

  const handleCancel = (event) => {
    setCancelType(event.target.value);
  };

  const handleAssist = (event) => {
    setAssist(event.target.value);
    setReason([]);
    setCancelType('');
  };

  const Items = () => {
    let items = '';
    if (pendings) {
      items = pendings.map((pending) => (
        <ListItem
          key={pending.idCita}
          secondaryAction={
            <IconButton onClick={() => handleEnd(pending)}>
              <Iconify icon="solar:archive-minimalistic-bold" />
            </IconButton>
          }
        >
          <ListItemText primary={pending.titulo} />
          <ListItemText primary={pending.fechaInicio} />
        </ListItem>
      ));
    }
    return items;
  };

  const endSubmit = async () => {
    switch (assist) {
      case 0:
        try {
          const resp = await cancelAppointment(selectEvent, cancelType);

          if (resp.result) {
            enqueueSnackbar(resp.msg);
            handleClose2();
          } else {
            enqueueSnackbar(resp.msg, { variant: 'error' });
          }

          setOpen(false);
          onClose();
        } catch (error) {
          enqueueSnackbar('Ha ocurrido un error al cancelar', { variant: 'error' });
          setOpen(false);
          onClose();
        }
        break;

      case 1:
        try {
          const resp = await endAppointment(selectEvent.idCita, reason);

          if (resp.result) {
            enqueueSnackbar(resp.msg);
            handleClose2();
          } else {
            enqueueSnackbar(resp.msg, { variant: 'error' });
          }

          setOpen(false);
          onClose();
        } catch (error) {
          enqueueSnackbar('Ha ocurrido un error', { variant: 'error' });
          setOpen2(false);
          onClose();
        }
        break;

      default:
        break;
    }
  };

  return (
    <>
      <Helmet>
        <title> Dashboard: App</title>
      </Helmet>

      <OverviewAppView />
      <PendingModal />
    </>
  );
}