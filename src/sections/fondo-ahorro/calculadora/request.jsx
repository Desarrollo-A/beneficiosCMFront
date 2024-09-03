import * as Yup from 'yup';
import { mutate } from 'swr';
import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useFormState, } from 'react-hook-form';

import Step from '@mui/material/Step';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Stepper from '@mui/material/Stepper';
import Check from '@mui/icons-material/Check';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import StepLabel from '@mui/material/StepLabel';
import { Box, Typography } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { useBoolean } from 'src/hooks/use-boolean';

import { endpoints } from 'src/utils/axios';

import { useUpdate } from 'src/api/reportes';
import { useAuthContext } from 'src/auth/hooks';

import Iconify from 'src/components/iconify/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import FormProvider, {
  RHFTextField,
} from 'src/components/hook-form';

// eslint-disable-next-line import/no-cycle
import Simulator from './simulator';

const steps = ['Tener en cuenta', 'Calcula tu ahorro', 'Envia tu solicitud'];

// ----------------------------------------------------------------------

const QontoStepIconRoot = styled('div')(() => ({
  color: '#eaeaf0',
  display: 'flex',
  height: 22,
  alignItems: 'center',
  '& .QontoStepIcon-completedIcon': {
    color: '#00263A',
    zIndex: 1,
    fontSize: 18,
  },
  '& .QontoStepIcon-circle': {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: 'currentColor',
  },
  variants: [
    {
      props: ({ ownerState }) => ownerState.active,
      style: {
        color: '#00263A',
      },
    },
  ],
}));
function QontoStepIcon(props) {
  const { active, completed, className } = props;

  return (
    <QontoStepIconRoot ownerState={{ active }} className={className}>
      {completed ? (
        <Check className="QontoStepIcon-completedIcon" />
      ) : (
        <div className="QontoStepIcon-circle" />
      )}
    </QontoStepIconRoot>
  );
}

QontoStepIcon.propTypes = {
  /**
   * Whether this step is active.
   * @default false
   */
  active: PropTypes.bool,
  className: PropTypes.string,
  /**
   * Mark the step as completed. Is passed to child components.
   * @default false
   */
  completed: PropTypes.bool,
};

export default function Request({ onClose, FirstDay, dateNext }) {

  const updateEstatus = useUpdate(endpoints.fondoAhorro.sendMail);

  const { user } = useAuthContext();

  const { enqueueSnackbar } = useSnackbar();

  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState({});

  const totalSteps = () => steps.length;

  const completedSteps = () => Object.keys(completed).length;

  const isLastStep = () => activeStep === totalSteps() - 1;

  const allStepsCompleted = () => completedSteps() === totalSteps();

  const handleNext = () => {
    const newActiveStep =
      isLastStep() && !allStepsCompleted()
        ?
        steps.findIndex((step, i) => !(i in completed))
        : activeStep + 1;
    setActiveStep(newActiveStep);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setCompleted({
      ...completed,
      [activeStep]: false,
    });
  };

  const handleComplete = () => {
    setCompleted({
      ...completed,
      [activeStep]: true,
    });
    handleNext();
  };

  const getBackgroundColor = (step) => {
    switch (step) {
      case 0:
        return '#ebffe8';
      case 1:
        return '#F2EEE3';
      case 2:
        return '#effeff';
      default:
        return 'defaultColor';
    }
  };

  const NewProductSchema = Yup.object().shape({
    ahorroFinal: Yup.number()
      .typeError('Debe ser un número')
      .required('Ingresa un monto')
      .positive('Debe ser un número positivo')
      .min(500.00, 'Debe ser mayor o igual a $500')
      .max(10000.00, 'Debe ser menor o igual a $10,000'),
  });

  const defaultValues = useMemo(
    () => ({
      ahorroFinal: '',
    }),
    []
  );

  const methods = useForm({
    resolver: yupResolver(NewProductSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const { isValid, dirtyFields } = useFormState({ control: methods.control });

  const isButtonDisabled = !isValid || !dirtyFields.ahorroFinal;

  const onSubmit = handleSubmit(async (data) => {

    const dataValue = {
      idUsuario: user?.idUsuario,
      nombre: user?.nombre,
      numEmpleado: user?.numEmpleado,
      idContrato: user?.idContrato,
      FirstDay,
      dateNext,
      ...data,
    };

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

       const update = await updateEstatus(dataValue);

       if (update.estatus === true) {
      enqueueSnackbar(update.msj, { variant: 'success' });

      mutate(endpoints.fondoAhorro.getFondo);

    } else {
      enqueueSnackbar(update.msj, { variant: 'error' });
    }

    } catch (error) {
      console.error(error);
    }

    onClose();
  });

  const confirm = useBoolean();

  return (
    <>
      <Box sx={{ backgroundColor: getBackgroundColor(activeStep) }}>
        <Grid container alignItems="stretch" spacing={2}
          sx={{
            p: 2,
            borderRadius: '20px',
            margin: '20px',
          }}>
          <Grid item xs={12}>
            <Grid container justifyContent="center" >
              <Stepper nonLinear activeStep={activeStep} >
                {steps.map((label, index) => (
                  <Step key={label} completed={completed[index]} >
                    <StepLabel StepIconComponent={QontoStepIcon} /* onClick={handleStep(index)} */>
                      <Typography fontSize={13}>
                        {label}
                      </Typography>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Grid>

            <Box mb={2} />

            {activeStep === 0 && (
              <Grid container justifyContent="center" className="fade-in">
                <Box component="ul" sx={{ paddingRight: 6 }}>
                  <Box
                    component="li"
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      marginBottom: 2,
                    }}
                  >
                    <Box sx={{ width: 24, height: 24, flexShrink: 0, marginRight: 1 }}>
                      <Iconify
                        icon="lets-icons:done-duotone"
                        width="100%" // El ícono ocupa todo el tamaño del contenedor
                        height="100%"
                        sx={{ color: '#00d526' }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', textAlign: 'justify' }}>
                        El ahorro que solicitas será de forma mensual y se te descontará proporcionalmente a la semana.
                      </Typography>
                      <Typography variant="body1" sx={{ fontStyle: 'italic', textAlign: 'justify' }}>
                        Ejemplo: Solicitas de $400.00 al mes, se te descontarán $100.00 a la semana (Aprox.).
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    component="li"
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      marginBottom: 2,
                    }}
                  >
                    <Box sx={{ width: 24, height: 24, flexShrink: 0, marginRight: 1 }}>
                      <Iconify
                        icon="lets-icons:done-duotone"
                        width="100%"
                        height="100%"
                        sx={{ color: '#00d526' }}
                      />
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', textAlign: 'justify' }}>
                      El ahorro se puede cancelar en cualquier momento.
                    </Typography>
                  </Box>

                  <Box
                    component="li"
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      marginBottom: 2,
                    }}
                  >
                    <Box sx={{ width: 24, height: 24, flexShrink: 0, marginRight: 1 }}>
                      <Iconify
                        icon="lets-icons:done-duotone"
                        width="100%"
                        height="100%"
                        sx={{ color: '#00d526' }}
                      />
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', textAlign: 'justify' }}>
                      La solicitud se procesará para tu firma digital, solo puedes generar tu firma una vez.
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )}

            {activeStep === 1 && (
              <Simulator conditional={1} />
            )}

            {activeStep === 2 && (
              <FormProvider methods={methods} onSubmit={onSubmit}>
                <Stack spacing={3} sx={{ p: 3 }} className="fade-in">
                  <RHFTextField
                    name="ahorroFinal"
                    size="small"
                    label="Confirma tu monto mensual a ahorrar"
                    placeholder="0.00"
                    type="number"
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Box component="span" sx={{ color: 'text.disabled' }}>
                            $
                          </Box>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderWidth: '.15em',
                          borderColor: '#0056a1',
                        },
                        '&:hover fieldset': {
                          borderWidth: '.15em',
                          borderColor: '#0056a1',
                        },
                        '&.Mui-focused fieldset': {
                          borderWidth: '.15em',
                          borderColor: '#0056a1',
                        },
                      },
                    }}
                  />
                </Stack>
              </FormProvider>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
              <Button
                color="inherit"
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
                <Iconify icon="material-symbols-light:chevron-backward" width={24} /> Regresar
              </Button>
              <Box sx={{ flex: '1 1 auto' }} />

              {activeStep !== 2 ? (
                <Button onClick={handleComplete} sx={{ mr: 1 }}>
                  Siguiente <Iconify icon="material-symbols-light:navigate-next" width={24} />
                </Button>
              ) : (
                <Button onClick={() => { confirm.onTrue() }} disabled={isButtonDisabled}>
                  Enviar <Iconify icon="lets-icons:send-hor-light" width={24} />
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        content={<Typography>¿Estás seguro de mandar tu solicitud con ese monto?</Typography>}
        action={
          <>
            <Button variant="contained" color="error" onClick={() => { confirm.onFalse() }}>
              Cancelar
            </Button>
            <LoadingButton variant="contained" color="success" onClick={handleSubmit(onSubmit)} loading={isSubmitting}>
              Aceptar
            </LoadingButton>
          </>
        }
      />
    </>
  );
}

Request.propTypes = {
  onClose: PropTypes.any,
  dateNext: PropTypes.any,
  FirstDay: PropTypes.any
};
