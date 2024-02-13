import PropTypes from 'prop-types';
import { Controller, useFormContext } from 'react-hook-form';

import { MobileDatePicker } from '@mui/x-date-pickers';

// ----------------------------------------------------------------------

export default function RHFDatePicker({ name, label, value, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={value}
      shouldUnregister
      render={({ field }) => (
        <MobileDatePicker
          disabled={field.disabled}
          sx={{ width: '100%' }}
          label={label}
          defaultValue={field.value}
          onChange={(newValue) => {
            field.onChange(newValue);
          } } />
      )}
    />
  );
}

RHFDatePicker.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string,
};
