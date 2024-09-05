import { Card, Container, Typography } from "@mui/material";

import { useSettingsContext } from 'src/components/settings';

export default function AsesorView(){
    const settings = useSettingsContext();

    return(
        <Container  maxWidth={settings.themeStretch ? false : 'lg'}>
            <Card>
                <Typography>
                    A
                </Typography>
            </Card>
        </Container>
    );
}