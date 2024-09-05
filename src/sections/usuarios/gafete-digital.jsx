import PropTypes from 'prop-types';
import { Global } from '@emotion/react';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { grey } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import CssBaseline from '@mui/material/CssBaseline';
import useMediaQuery from '@mui/material/useMediaQuery';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';

import { useAuthContext } from 'src/auth/hooks';

import Iconify from 'src/components/iconify/iconify';

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
    const [open, setOpen] = useState(true);

    const [animationKey, setAnimationKey] = useState(0);

    const { user } = useAuthContext();

    const toggleDrawer = (newOpen) => () => {
        setOpen(newOpen);
    };

    const container = window !== undefined ? () => window().document.body : undefined;

    const [showInitialView, setShowInitialView] = useState(true);

    const handleClick = useCallback(() => {
        setAnimationKey(prev => prev + 1); // Cambiar clave para reiniciar la animación
        setTimeout(() => {
            setShowInitialView(prev => !prev);
        }, 1000); // Tiempo para esperar antes de cambiar la vista
    }, []);

    const isMobile = useMediaQuery('(max-width: 960px)');

    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoaded(true);
        }, 2000); // Ajusta el tiempo según la duración de las animaciones

        return () => clearTimeout(timer);
    }, []);

    return (

        isMobile ? (
            <Root sx={{ borderRadius: '20px' }}>
                <CssBaseline />
                <Global
                    styles={{
                        '.MuiDrawer-root > .MuiPaper-root': {
                            height: `calc(100% - ${drawerBleeding}px)`,
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
                            backgroundColor: '#fff', // Ajusta el color si es necesario
                        }}
                    >
                        <Puller />
                        <Box sx={{
                            p: 2,
                            backgroundColor: '#fff'
                        }}>
                        ㅤ
                    </Box>
                    </StyledBox>
                    <Button
                        sx={{
                            height: '80px'
                        }}
                        onClick={handleClick}
                    >
                        <Iconify icon="uim:refresh" width={24} />
                        <Typography sx={{ p: 0.2, fontWeight: 'bold', fontSize: '12px' }}>
                            Girar gafete
                        </Typography>

                    </Button>
                    {showInitialView ? (
                        <Box
                            sx={{
                                p: 3,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: `calc(100vh - ${drawerBleeding}px)`, // Ajusta la altura del contenedor
                            }}
                        >
                            <Grid container key={animationKey} spacing={2} sx={{ height: '100%' }}>
                                <Grid item xs={12} >
                                    <Box className='card'>
                                        <Stack
                                            alignItems="center"
                                            sx={{
                                                mb: 40,
                                                width: { xs: '210px', sm: '220px' },
                                                height: { xs: '210px', sm: '220px' },
                                                backgroundImage: `url(${import.meta.env.BASE_URL}assets/images/gafete/logoMaderas.svg)`,
                                                backgroundSize: '100% 100%',
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: 'center',
                                                zIndex: 2,
                                                position: 'absolute',
                                            }}
                                        />

                                        <Card
                                            sx={{
                                                position: 'absolute',
                                                top: '55%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                width: { xs: '200px', sm: '220px' },
                                                height: { xs: '200px', sm: '220px' },
                                                backgroundImage: `url(${import.meta.env.BASE_URL}assets/images/perfil/user.png)`,
                                                backgroundSize: 'contain',
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: 'center',
                                                zIndex: 3,
                                            }}
                                        />

                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: 'white',
                                                fontWeight: 'italic',
                                                textAlign: 'center',
                                                zIndex: 3,
                                                top: 'calc(85% - 20px)',
                                                position: 'absolute',
                                                padding: '1px',
                                                fontSize: '12px',
                                                maxWidth: '80vw;',
                                            }}
                                        >
                                            {user?.nombre}
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: 'white',
                                                fontWeight: 'italic',
                                                textAlign: 'center',
                                                zIndex: 3,
                                                top: 'calc(88% - 20px)',
                                                position: 'absolute',
                                                padding: '8px',
                                                fontSize: '16px',
                                                maxWidth: '200px',
                                            }}
                                        >
                                            {user?.numEmpleado}
                                        </Typography>

                                        <Box className="card-line-front" sx={{ zIndex: 2, top: 'calc(95% - 20px)' }} />
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: 'white',
                                                fontWeight: 'italic',
                                                textAlign: 'center',
                                                zIndex: 3,
                                                top: 'calc(95% - 20px)',
                                                position: 'absolute',
                                                padding: '8px',
                                                fontSize: '16px',
                                                maxWidth: '200px',
                                            }}
                                        >
                                            Programador Analista
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>

                    ) : (
                        <Box
                            sx={{
                                p: 3,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: `calc(100vh - ${drawerBleeding}px)`,
                            }}
                        >
                            <Grid container key={animationKey} spacing={2} sx={{ height: '100%' }}>
                                <Grid item xs={12}>
                                    <Box
                                        className='card zoom-shake'
                                        sx={{
                                            width: '100%',
                                            height: '100%',
                                            position: 'relative',
                                            zIndex: 2,
                                            background: 'black'
                                        }}
                                    >
                                        <Stack
                                            alignItems="center"
                                            sx={{
                                                mb: 40,
                                                width: { xs: '210px', sm: '220px' },
                                                height: { xs: '210px', sm: '220px' },
                                                backgroundImage: `url(${import.meta.env.BASE_URL}assets/images/gafete/logoMaderas.svg)`,
                                                backgroundSize: '100% 100%',
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: 'center',
                                                zIndex: 2,
                                                position: 'absolute',
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
                                                Oficina: <Typography component="span" sx={{ fontWeight: 'bold' }}>{user?.oficina}</Typography>
                                            </Typography>
                                            <Box mb={1} />
                                            <Typography variant="body1" sx={{ fontWeight: 'italic', textAlign: 'justify' }}>
                                                Área: <Typography component="span" sx={{ fontWeight: 'bold' }}>TI</Typography>
                                            </Typography>
                                            <Box mb={1} />
                                            <Typography variant="body1" sx={{ fontWeight: 'italic', textAlign: 'justify' }}>
                                                Ingreso: <Typography component="span" sx={{ fontWeight: 'bold' }}>2020-01-20</Typography>
                                            </Typography>
                                            <Box mb={1} />
                                            <Typography variant="body1" sx={{ fontWeight: 'italic', textAlign: 'justify' }}>
                                                IMMS: <Typography component="span" sx={{ fontWeight: 'bold' }}>8574963214</Typography>
                                            </Typography>
                                            <Box mb={1} />
                                        </Stack>

                                        <Box className="card-line-back" sx={{
                                            zIndex: 2, top: 'calc(98.5% - 20px)',
                                            position: 'absolute',
                                        }} />
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                backgroundColor: '#07182E',
                                                color: 'white',
                                                fontWeight: 'italic',
                                                textAlign: 'center',
                                                zIndex: 3,
                                                top: 'calc(95% - 20px)',
                                                position: 'absolute',
                                                padding: '8px',
                                            }}
                                        >
                                            CREADORES DE CIUDADES
                                        </Typography>
                                    </Box>
                                </Grid>

                            </Grid>
                        </Box>
                    )}
                </SwipeableDrawer>
            </Root>
        ) : (
            <Grid container sx={{ height: '100%' }}>
                <Grid item xs={6} className={`grid-item1 ${loaded ? 'loaded' : ''}`}>
                    <Stack
                        className='correaDdesktop'
                        alignItems="center"
                        sx={{
                            top: -24,
                            right: '-43%',
                            width: { xs: '210px', sm: '220px' },
                            height: { xs: '210px', sm: '220px' },
                            backgroundImage: `url(${import.meta.env.BASE_URL}assets/images/gafete/correa.svg)`,
                            backgroundSize: '100% 100%',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center',
                            zIndex: 3,
                            position: 'relative',
                        }}
                    />
                    <Box className='cardDdesktop' sx={{
                        width: '100%',
                        height: '100%',
                        position: 'relative',
                        zIndex: 2,
                        background: 'black',
                        top: -60,
                        left: '37%',

                    }}>
                        <Stack
                            alignItems="center"
                            sx={{
                                mb: 35,
                                width: '200px',
                                height: '200px',
                                backgroundImage: `url(${import.meta.env.BASE_URL}assets/images/gafete/logoMaderas.svg)`,
                                backgroundSize: '100% 100%',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center',
                                zIndex: 2,
                                position: 'relative',
                            }}
                        />

                        <Card
                            sx={{
                                position: 'absolute',
                                top: '58%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '200px',
                                height: '200px',
                                backgroundImage: `url(${import.meta.env.BASE_URL}assets/images/perfil/user.png)`,
                                backgroundSize: 'contain',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center',
                                zIndex: 3,
                            }}
                        />

                        <Typography
                            variant="body2"
                            sx={{
                                color: 'white',
                                fontWeight: 'italic',
                                textAlign: 'center',
                                zIndex: 3,
                                top: 'calc(86% - 20px)',
                                position: 'absolute',
                                padding: '1px',
                                fontSize: '12px',
                                maxWidth: '80vw;',
                            }}
                        >
                            {user?.nombre}
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{
                                color: 'white',
                                fontWeight: 'italic',
                                textAlign: 'center',
                                zIndex: 3,
                                top: 'calc(88% - 20px)',
                                position: 'absolute',
                                padding: '8px',
                                fontSize: '16px',
                                maxWidth: '200px',
                            }}
                        >
                            {user?.numEmpleado}
                        </Typography>

                        <Box className="card-line-front" sx={{ zIndex: 2, top: 'calc(95% - 20px)' }} />
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'white',
                                fontWeight: 'italic',
                                textAlign: 'center',
                                zIndex: 3,
                                top: 'calc(95% - 20px)',
                                position: 'absolute',
                                padding: '8px',
                                fontSize: '16px',
                                maxWidth: '200px',
                            }}
                        >
                            Programador Analista
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={6} className='grid-item2'>
                    <Stack
                        className='correaDdesktop'
                        alignItems="center"
                        sx={{
                            top: -24,
                            left: '23%',
                            width: { xs: '210px', sm: '220px' },
                            height: { xs: '210px', sm: '220px' },
                            backgroundImage: `url(${import.meta.env.BASE_URL}assets/images/gafete/correa.svg)`,
                            backgroundSize: '100% 100%',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center',
                            zIndex: 3,
                            position: 'relative',
                        }}
                    />
                    <Box
                        className='cardDdesktop'
                        sx={{
                            width: '100%',
                            height: '100%',
                            position: 'relative',
                            zIndex: 2,
                            background: 'black',
                            top: -217,
                            left: '17%',
                        }}
                    >
                        <Stack
                            alignItems="center"
                            sx={{
                                mb: 35,
                                width: '200px',
                                height: '200px',
                                backgroundImage: `url(${import.meta.env.BASE_URL}assets/images/gafete/logoMaderas.svg)`,
                                backgroundSize: '100% 100%',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center',
                                zIndex: 2,
                                position: 'absolute',
                            }}
                        />
                        <Stack
                            sx={{
                                position: 'absolute',
                                left: 45,
                                zIndex: 2,
                                color: 'white'
                            }}
                        >
                            <Typography variant="body1" sx={{ fontWeight: 'italic', textAlign: 'justify' }}>
                                Oficina: <Typography component="span" sx={{ fontWeight: 'bold' }}>{user?.oficina}</Typography>
                            </Typography>
                            <Box mb={1} />
                            <Typography variant="body1" sx={{ fontWeight: 'italic', textAlign: 'justify' }}>
                                Área: <Typography component="span" sx={{ fontWeight: 'bold' }}>TI</Typography>
                            </Typography>
                            <Box mb={1} />
                            <Typography variant="body1" sx={{ fontWeight: 'italic', textAlign: 'justify' }}>
                                Ingreso: <Typography component="span" sx={{ fontWeight: 'bold' }}>2020-01-20</Typography>
                            </Typography>
                            <Box mb={1} />
                            <Typography variant="body1" sx={{ fontWeight: 'italic', textAlign: 'justify' }}>
                                IMMS: <Typography component="span" sx={{ fontWeight: 'bold' }}>8574963214</Typography>
                            </Typography>
                            <Box mb={1} />
                        </Stack>

                        <Box className="card-line-back" sx={{
                            zIndex: 2, top: 'calc(98.5% - 20px)',
                            position: 'absolute',
                        }} />
                        <Typography
                            variant="body2"
                            sx={{
                                backgroundColor: '#07182E',
                                color: 'white',
                                fontWeight: 'italic',
                                textAlign: 'center',
                                zIndex: 3,
                                top: 'calc(95% - 20px)',
                                position: 'absolute',
                                padding: '8px',
                            }}
                        >
                            CREADORES DE CIUDADES
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
        )
    );
}

GafeteDigital.propTypes = {
    /**
     * Injected by the documentation to work in an iframe.
     * You won't need it on your project.
     */
    window: PropTypes.func,
};