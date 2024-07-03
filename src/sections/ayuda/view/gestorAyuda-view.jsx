import { useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { alpha } from '@mui/material/styles';
import TabContext from '@mui/lab/TabContext';
import Container from '@mui/material/Container';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import BaseFaqs from '../components/gestor-ayuda/faqs/base-faqs';
import BaseManuales from '../components/gestor-ayuda/manuales/base-manuales';
// ----------------------------------------------------------------------

export default function GestorAyudaView() {

    const settings = useSettingsContext();

    const [value, setValue] = useState('1');

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Container maxWidth={settings.themeStretch ? false : 'lg'}>

            <CustomBreadcrumbs
                heading="Gestor de ayuda"
                links={[
                    { name: 'Ayuda' },
                    { name: 'Gestor de ayuda' },
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
                                <Tab label="FAQS" value="1" />
                                <Tab label="Manuales" value="2" />
                            </TabList>
                        </Box>
                        <TabPanel value="1">
                            <BaseFaqs/>
                        </TabPanel>
                        <TabPanel value="2">
                            <BaseManuales/>
                        </TabPanel>
                    </TabContext>
                </Box>
            </Card>
        </Container>
    );
}
