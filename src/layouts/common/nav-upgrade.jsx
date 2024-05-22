import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export default function NavUpgrade() {

  const today = new Date();
  const year = today.getFullYear();

  return (
    <Stack
      sx={{
        px: 2,
        py: 0,
        textAlign: 'center',
        position: 'absolute',
        bottom : 0
      }}
    >
      <Stack alignItems="center">

          <Box component="img" sx={{ position: 'relative', justifyContent:'flex-end', width: '60%', filter: "invert(66%) sepia(100%) saturate(100%) hue-rotate(172deg) brightness(50%) contrast(94%)" }} src={`${import.meta.env.BASE_URL}assets/img/logoBeneficios.svg`} />

        <Stack spacing={0.5} sx={{ mt: 1.5, mb: 2 }}>

          <Typography variant="subtitle2" noWrap sx={{ color: 'text.disabled' }} style={{lineHeight:"1", fontSize:"10px"}}>
          © Ciudad Maderas, <br/> Departamento TI
          </Typography>

          <Typography variant="subtitle2" noWrap sx={{ color: 'text.disabled' }} style={{lineHeight:"1", fontSize:"10px"}}>
            {year}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
}