import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import { fDateTime } from 'src/utils/format-time';

import Label from 'src/components/label';
import Image from 'src/components/image';
import Iconify from 'src/components/iconify';
import Carousel, { useCarousel, CarouselDots, CarouselArrows } from 'src/components/carousel';
import { width } from '@mui/system';

// ----------------------------------------------------------------------

export default function Patrocinadores({ title, subheader, list, sx, ...other }) {

    const theme = useTheme();

    const patrocinios = [
        {
            "id": "1",
            "coverUrl": `queretaro`,
        },
        {
            "id": "2",
            "coverUrl": `cancun`,
        },
        {
            "id": "3",
            "coverUrl": `venados`,
        },
        {
            "id": "4",
            "coverUrl": `diablos`,
        },
        {
            "id": "5",
            "coverUrl": `charros`,
        },
        {
            "id": "6",
            "coverUrl": `monterrey`,
        },
        {
            "id": "7",
            "coverUrl": `puebla`,
        },
        {
            "id": "8",
            "coverUrl": `rieleros`,
        },
        {
            "id": "9",
            "coverUrl": `sandiego`,
        },
        {
            "id": "10",
            "coverUrl": `tigres`,
        },
    ];

    const carousel = useCarousel({
        speed: 1500,
        autoplay: true,
        ...CarouselDots({
            sx: {
                top: '105%',
                left: '50%',
                position: 'absolute',
                transform: 'translate(-50%, -50%)',
                color: '#BAA36B',
            },
        }),
        slidesToShow: 3,
        responsive: [
            {
                breakpoint: theme.breakpoints.values.lg,
                settings: {
                    slidesToShow: 3,
                },
            },
            {
                breakpoint: theme.breakpoints.values.md,
                settings: {
                    slidesToShow: 3,
                },
            },
            {
                breakpoint: theme.breakpoints.values.sm,
                settings: {
                    slidesToShow: 3,
                },
            },
        ],
    });

    return (
        <Grid container sx={{ backgroundColor: theme.palette.mode === 'dark' ? '#25303d' : 'white', borderRadius: 2, spacing: { xs: 2, sm: 4 }, flexDirection: { xs: 'column', sm: 'row' } }}>

            <Grid item xs={12} sm={5} sx={{ my: { xs: 2, sm: 5 }, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box mx={{ xs: 2, sm: 6 }} textAlign="left">
                    <Typography sx={{
                        fontSize: {
                            xs: '30px',
                            sm: '30px',
                            lg: '40px'
                        },
                        margin: 0
                    }}>
                        ORGULLOSOS
                    </Typography>
                    <Typography sx={{
                        fontWeight: 'bold',
                        fontSize: {
                            xs: '30px',
                            sm: '30px',
                            lg: '40px'
                        },
                        margin: 0
                    }}>
                        PATROCINADORES
                    </Typography>
                </Box>
            </Grid>

            <Grid item xs={12} sm={7} sx={{ my: { xs: 2, sm: 5 }, flex: 1 }}>
                <Carousel ref={carousel.carouselRef} {...carousel.carouselSettings}>
                    {patrocinios.map((item) => (
                        <BookingItem key={item.id} item={item} />
                    ))}
                </Carousel>
            </Grid>

        </Grid>

    );
}

Patrocinadores.propTypes = {
    list: PropTypes.array,
    subheader: PropTypes.string,
    sx: PropTypes.object,
    title: PropTypes.string,
};

// ----------------------------------------------------------------------

function BookingItem({ item }) {
    const { coverUrl } = item;

    return (
        <Box sx={{ position: 'relative' }}>
            <Image alt={coverUrl} src={`${import.meta.env.BASE_URL}assets/images/boletos/${coverUrl}.png`}
                sx={{
                    borderRadius: 1.5,
                    width: '100px',
                    filter: 'grayscale(100%)',
                    transition: 'filter 0.3s ease',
                    '&:hover': {
                        filter: 'grayscale(0%)',
                    },
                }} />
        </Box>
    );
}

BookingItem.propTypes = {
    item: PropTypes.object,
};
