import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import ListItemText from '@mui/material/ListItemText';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import { fData } from 'src/utils/format-number';

import Iconify from 'src/components/iconify';

export default function SedeItem({value, handleOpen, sx, ...other}){

    const details = useBoolean();

    const smUp = useResponsive('up', 'sm');

    return (
        <Stack
            component={Paper}
            variant="outlined"
            spacing={1}
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'unset', sm: 'center' }}
            sx={{
            borderRadius: 2,
            bgcolor: 'unset',
            cursor: 'pointer',
            position: 'relative',
            p: { xs: 2.5, sm: 2 },
            '&:hover': {
                bgcolor: 'background.paper',
                boxShadow: (theme) => theme.customShadows.z20,
            },
            ...sx,
            }}
            {...other}
        >

            <ListItemText
            key={1}
            onClick={details.onTrue}
            primary={value.sede}
            secondary={
                <>
                {fData()}
                <Box
                    sx={{
                    mx: 0.75,
                    width: 2,
                    height: 2,
                    borderRadius: '50%',
                    bgcolor: 'currentColor',
                    }}
                />
                {"Fecha de creación: "}{value.fechaCreacion}
                </>
            }
            primaryTypographyProps={{
                noWrap: true,
                typography: 'subtitle2',
            }}
            secondaryTypographyProps={{
                mt: 0.5,
                component: 'span',
                alignItems: 'center',
                typography: 'caption',
                color: 'text.disabled',
                display: 'inline-flex',
            }}
            />
            <Box
            sx={{
                top: 0,
                right: 8,
                position: 'absolute',
                ...(smUp && {
                flexShrink: 0,
                position: 'unset',
                }),
            }}
            >

            <Button
                variant="contained"
                color="primary"
                onClick={() => {
                handleOpen(value.idSede);
                }}
            >
                Asignar <Iconify icon="lets-icons:add-duotone" />
            </Button>
            </Box>

        </Stack>
    )
}

SedeItem.propTypes = {
    handleOpen : PropTypes.func,
    value: PropTypes.any,
    sx: PropTypes.any,
  };