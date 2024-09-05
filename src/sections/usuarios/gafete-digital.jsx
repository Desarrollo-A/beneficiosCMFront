import * as React from 'react';
import PropTypes from 'prop-types';
import { Global } from '@emotion/react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { grey } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import CssBaseline from '@mui/material/CssBaseline';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';

import './styles.css'

const drawerBleeding = 56;

const Root = styled('div')(() => ({
    height: '100%',
    backgroundColor: grey[100],
}));

const StyledBox = styled('div')(() => ({
    backgroundColor: '#fff'
}));

const Puller = styled('div')(() => ({
    width: 30,
    height: 6,
    backgroundColor: grey[300],
    borderRadius: 3,
    position: 'absolute',
    top: 8,
    left: 'calc(50% - 15px)'
}));

export default function GafeteDigital(props) {
    const { window } = props;
    const [open, setOpen] = React.useState(true);

    const toggleDrawer = (newOpen) => () => {
        setOpen(newOpen);
    };

    // This is used only for the example
    const container = window !== undefined ? () => window().document.body : undefined;

    return (
        <Root sx={{ borderRadius: '20px' }}>
            <CssBaseline />
            <Global
                styles={{
                    '.MuiDrawer-root > .MuiPaper-root': {
                        height: `calc(70% - ${drawerBleeding}px)`,
                        overflow: 'visible',
                    },
                }}
            />
            <Box sx={{ textAlign: 'center', pt: 1 }}>
                <Button onClick={toggleDrawer(true)}>Vizualizar gafete</Button>
            </Box>
            <SwipeableDrawer
                container={container}
                anchor="bottom"
                open={open}
                onClose={toggleDrawer(false)}
                onOpen={toggleDrawer(true)}
                swipeAreaWidth={drawerBleeding}
                disableSwipeToOpen={false}
                ModalProps={{
                    keepMounted: true,
                }}
            >
                <StyledBox
                    sx={{
                        position: 'absolute',
                        top: -drawerBleeding,
                        borderTopLeftRadius: 8,
                        borderTopRightRadius: 8,
                        visibility: 'visible',
                        right: 0,
                        left: 0,
                    }}
                >
                    <Puller />
                    <Typography sx={{ p: 2, color: 'text.secondary' }}>51 results</Typography>
                </StyledBox>
                {/*  <StyledBox sx={{ px: 2, pb: 2, height: '100%', overflow: 'auto' }}> */}
                <Box sx={{
                    p: 3,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                }}>
                    <Grid container
                        className="fade-in"
                        spacing={2}
                        sx={{ height: '58vh' }}
                    >
                        <Grid item xs={6}>
                            <Box
                                className="card"
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    zIndex: 2,
                                }}
                            >
                                <Stack
                                    alignItems="center"
                                    sx={{
                                        mb: 40,
                                        width: '70%',
                                        height: '100%',
                                        backgroundImage: `url(${import.meta.env.BASE_URL}assets/images/gafete/logoMaderas.svg)`,
                                        backgroundSize: '100% 100%',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'center',
                                        zIndex: 2,
                                    }}
                                />

                                <Box className="card-line-front" sx={{ zIndex: 2, top: 430 }} />
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: 'white',
                                        fontWeight: 'italic',
                                        textAlign: 'center',
                                        zIndex: 3,
                                        top: 430,
                                        position: 'absolute',
                                        padding: '8px',
                                        fontSize: '16px'
                                    }}
                                >
                                    Programador Analista
                                </Typography>
                            </Box>
                        </Grid>
                       {/*  <Grid item xs={6} sx={{ px: 5 }}>
                            <Box
                                className="card"
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    position: 'relative',
                                    zIndex: 2,
                                    background: 'black' // Color de fondo para contraste
                                }}
                            >
                                <Stack
                                    alignItems="center"
                                    justifyContent="center"
                                    sx={{
                                        width: '70%',
                                        height: '100%',
                                        position: 'absolute',
                                        top: -120,
                                        left: 40,
                                        backgroundImage: `url(${import.meta.env.BASE_URL}assets/images/gafete/logoMaderas.svg)`,
                                        backgroundSize: 'contain',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'center',
                                        zIndex: 1,
                                    }}
                                />
                                <Stack
                                    sx={{
                                        position: 'absolute',
                                        left: 40,
                                        zIndex: 2,
                                        color: 'white'
                                    }}
                                >
                                    <Typography variant="body1" sx={{ fontWeight: 'italic', textAlign: 'justify' }}>
                                        Oficina: <Typography component="span" sx={{ fontWeight: 'bold' }}>Rio de la Loza</Typography>
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 'italic', textAlign: 'justify' }}>
                                        Área: <Typography component="span" sx={{ fontWeight: 'bold' }}>TI</Typography>
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 'italic', textAlign: 'justify' }}>
                                        Ingreso: <Typography component="span" sx={{ fontWeight: 'bold' }}>2020-01-20</Typography>
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 'italic', textAlign: 'justify' }}>
                                        IMMS: <Typography component="span" sx={{ fontWeight: 'bold' }}>8574963214</Typography>
                                    </Typography>
                                </Stack>

                                <Box className="card-line-back" sx={{ zIndex: 2, top: 370 }} />
                                <Typography
                                    variant="body2"
                                    sx={{
                                        backgroundColor: '#07182E',
                                        color: 'white',
                                        fontWeight: 'italic',
                                        textAlign: 'center',
                                        zIndex: 3,
                                        top: 352,
                                        position: 'absolute',
                                        padding: '8px',
                                    }}
                                >
                                    CREADORES DE CIUDADES
                                </Typography>
                            </Box>
                        </Grid> */}

                    </Grid>
                </Box>

                {/* </StyledBox> */}
            </SwipeableDrawer>
        </Root>
    );
}

GafeteDigital.propTypes = {
    /**
     * Injected by the documentation to work in an iframe.
     * You won't need it on your project.
     */
    window: PropTypes.func,
};