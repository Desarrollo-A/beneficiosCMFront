import { useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import TabList from '@mui/lab/TabList';
import { alpha } from '@mui/material/styles';
import TabContext from '@mui/lab/TabContext';
import Container from '@mui/material/Container';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import BasePreguntasCh from '../preguntasFrecuentes-components/basePreguntas-ch';
// ----------------------------------------------------------------------

export default function InvoiceNewEditForm() {

    const settings = useSettingsContext();

    const [value, setValue] = useState('1');

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Container maxWidth={settings.themeStretch ? false : 'lg'}>

            <CustomBreadcrumbs
                heading="Preguntas frecuentes capital humano"
                links={[
                    { name: 'Gestor' },
                    { name: 'FAQS CH' },
                ]}
                sx={{
                    mb: { xs: 3, md: 5 },
                }}
            />

            <Card>
                <Box sx={{
                    px: 2.5,
                    boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
                }}>
                    <TabContext value={value}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <TabList onChange={handleChange} aria-label="lab API tabs example">
                                <Tab label="Preguntas frecuentes" value="1" />
                            </TabList>
                        </Box>
                      
                            <BasePreguntasCh/>
                       
                    </TabContext>
                </Box>
            </Card>
        </Container>
    );
}
