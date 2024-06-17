import PropTypes from 'prop-types';
import { Controller, useFormContext } from 'react-hook-form';

import TextField from '@mui/material/TextField';

// ----------------------------------------------------------------------

export default function RHFTextField({ name, helperText, type, color=null, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      defaultValue = '' // se añade esta linea para evitar error de uncontrolled a controlled
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          inputProps={{
            style: {color: color && color}
          }}
          fullWidth
          type={type}
          value={type === 'number' && field.value === 0 ? '' : field.value}
          onChange={(event) => {
            if (type === 'number') {
              field.onChange(Number(event.target.value));
            } else {
              field.onChange(event.target.value);
            }
          }}
          error={!!error}
          helperText={error ? error?.message : helperText}
          {...other}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '7px',
              
              border: '1px solid #909090',
              ':hover': {
                border: `0.5px solid ${color} !important`,
                // boxShadow: '-1px 1px 4px 4px #EEE'
              },
              ':focus-within': { border: `0.5px solid ${color} !important` }
            },
            '& .MuiOutlinedInput-root.Mui-disabled': {
              ':hover': {
                border: '1px solid #909090 !important',
                boxShadow: 'none'
              }
            },
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none'
            },
            '.input-group:focus-within label': {
              color: 'red'
            },
              '.css-s5pem-MuiFormLabel-root-MuiInputLabel-root.MuiInputLabel-shrink': {
                backgroundColor: 'white',
                color: 'black',
                paddingLeft: 1,
                paddingRight: 1
              }
          }}
        />
      )}
    />
  );
}

RHFTextField.propTypes = {
  helperText: PropTypes.object,
  name: PropTypes.string,
  type: PropTypes.string,
  color: PropTypes.string,
};
