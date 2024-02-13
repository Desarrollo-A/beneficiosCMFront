import PropTypes from 'prop-types';
import { Controller, useFormContext } from 'react-hook-form';

import TextField from '@mui/material/TextField';

// ----------------------------------------------------------------------

export default function RHFHidden({ name, value, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      defaultValue = {value}
      shouldUnregister
      render={({ field }) => (
        <input
          type="hidden"
          name={field.name}
          value={field.value}
          onChange={(event) => {
            field.onChange(event.target.value)
          }}/>
      )}
    />
  );
}

RHFHidden.propTypes = {
  name: PropTypes.string,
};
