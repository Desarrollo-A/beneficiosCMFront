import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import AppointmentSchedule from '../appointment-schedule';

export default function ReescheduleDialog({
  open,
  onClose,
  selectedValues,
  handleChange,
  beneficios,
  errorBeneficio,
  especialistas,
  errorEspecialista,
  modalidades,
  errorModalidad,
  oficina,
  isLoading,
  isLoadingEspecialidad,
  isLoadingModalidad,
  handleDateChange,
  shouldDisableDate,
  horariosDisponibles,
  horarioSeleccionado,
  errorHorarioSeleccionado,
  currentEvent,
  handleHorarioSeleccionado,
  beneficioActivo,
  onAceptar,
  aceptar,
  beneficioDisabled,
  especialistaDisabled,
  modalidadDisabled,
  horariosDisabled,
  calendarDisabled,
  selectedDay,
  handleReSchedule,
  btnDisabled,
}) {
  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={open}
      aria-labelledby="alert-dialog-title1"
      aria-describedby="alert-dialog-description1"
    >
      <DialogContent
        sx={
          // !currentEvent?.id && selectedValues.modalidad ?
          {
            p: { xs: 1, md: 1 },
            background: {
              xs: 'linear-gradient(180deg, #2c3239 54%, white 46%)',
              md: 'linear-gradient(90deg, #2c3239 50%, white 50%)',
            },
            position: 'relative',
            display: { xs: 'inline-table' },
          }
          //  : { p: { xs: 1, md: 2 } }
        }
        direction="row"
        justifycontent="space-between"
      >
        <AppointmentSchedule
          selectedValues={selectedValues}
          handleChange={handleChange}
          beneficios={beneficios}
          errorBeneficio={errorBeneficio}
          especialistas={especialistas}
          errorEspecialista={errorEspecialista}
          modalidades={modalidades}
          errorModalidad={errorModalidad}
          oficina={oficina}
          isLoading={isLoading}
          isLoadingEspecialidad={isLoadingEspecialidad}
          isLoadingModalidad={isLoadingModalidad}
          handleDateChange={handleDateChange}
          shouldDisableDate={shouldDisableDate}
          horariosDisponibles={horariosDisponibles}
          horarioSeleccionado={horarioSeleccionado}
          errorHorarioSeleccionado={errorHorarioSeleccionado}
          currentEvent={currentEvent}
          handleHorarioSeleccionado={handleHorarioSeleccionado}
          beneficioActivo={beneficioActivo}
          aceptarTerminos={onAceptar}
          aceptar={aceptar}
          beneficioDisabled={beneficioDisabled}
          especialistaDisabled={especialistaDisabled}
          modalidadDisabled={modalidadDisabled}
          horariosDisabled={horariosDisabled}
          calendarDisabled={calendarDisabled}
          selectedDay={selectedDay}
        />
      </DialogContent>
      <DialogActions
        sx={
          // !currentEvent?.id && selectedValues.modalidad ?
          {
            background: {
              xs: 'white',
              md: 'linear-gradient(90deg, #2c3239 50%, white 50%)',
            },
          }
          //    : {}
        }
      >
        <Button variant="contained" color="error" onClick={onClose}>
          Cerrar
        </Button>
        {currentEvent?.id && (
          <LoadingButton
            variant="contained"
            color="success"
            onClick={handleReSchedule}
            loading={btnDisabled}
          >
            Reagendar
          </LoadingButton>
        )}
      </DialogActions>
    </Dialog>
  );
}

ReescheduleDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  selectedValues: PropTypes.object,
  handleChange: PropTypes.func,
  beneficios: PropTypes.array,
  errorBeneficio: PropTypes.bool,
  especialistas: PropTypes.array,
  errorEspecialista: PropTypes.bool,
  modalidades: PropTypes.array,
  errorModalidad: PropTypes.bool,
  oficina: PropTypes.object,
  isLoading: PropTypes.bool,
  isLoadingEspecialidad: PropTypes.bool,
  isLoadingModalidad: PropTypes.bool,
  handleDateChange: PropTypes.func,
  shouldDisableDate: PropTypes.func,
  horariosDisponibles: PropTypes.array,
  horarioSeleccionado: PropTypes.string,
  errorHorarioSeleccionado: PropTypes.bool,
  currentEvent: PropTypes.object,
  handleHorarioSeleccionado: PropTypes.func,
  beneficioActivo: PropTypes.object,
  onAceptar: PropTypes.func,
  aceptar: PropTypes.bool,
  beneficioDisabled: PropTypes.bool,
  especialistaDisabled: PropTypes.bool,
  modalidadDisabled: PropTypes.bool,
  horariosDisabled: PropTypes.bool,
  calendarDisabled: PropTypes.bool,
  selectedDay: PropTypes.any,
  handleReSchedule: PropTypes.func,
  btnDisabled: PropTypes.bool,
};
