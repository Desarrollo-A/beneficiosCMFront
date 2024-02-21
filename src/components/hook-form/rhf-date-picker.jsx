import PropTypes from 'prop-types';
import { Controller, useFormContext } from 'react-hook-form';
import { es } from 'date-fns/locale';

import TextField from '@mui/material/TextField';

import { MobileDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// ----------------------------------------------------------------------

export default function RHFDatePicker({ name, label, value, helperText, ...other }) {
  const { control } = useFormContext();

  const espa = {
    // idioma de los botones
    okButtonLabel: 'Seleccionar',
    cancelButtonLabel: 'Cancelar',
    datePickerToolbarTitle: 'Selecciona una fecha',
  };

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={value}
      shouldUnregister
      render={({ field, fieldState: { error } }) => (
        <LocalizationProvider
          adapterLocale={es}
          dateAdapter={AdapterDateFns}
          localeText={espa}
        >
          <MobileDatePicker
            disabled={field.disabled}
            sx={{ width: '100%' }}
            label={label}
            defaultValue={field.value}
            onChange={(newValue) => {
              field.onChange(newValue);
            } }
            slotProps={{
              textField: {
                fullWidth: true,
                variant: 'outlined',
                error: !!error,
                helperText : error ? error?.message : helperText
              },
            }}
            {...other}
          />
        </LocalizationProvider>
      )}
    />
  );
}

RHFDatePicker.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.any
};
