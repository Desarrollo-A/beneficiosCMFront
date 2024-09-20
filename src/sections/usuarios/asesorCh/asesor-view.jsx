import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import { Card, Grid, Container } from '@mui/material';

import { useSettingsContext } from 'src/components/settings';

export default function AsesorView() {
  const settings = useSettingsContext();

  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    ...theme.applyStyles('dark', {
      backgroundColor: '#1A2027',
    }),
  }));

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <Card sx={{ mb: 3, height: 290, padding: 3 }}>
        <Box sx={{ flexGrow: 1 }}>
            <Grid item>
                <Item>a</Item>
            </Grid>
            <Grid item >
                <Item>a</Item>
            </Grid>
        </Box>
      </Card>
    </Container>
  );
}
