// import { useState, useCallback } from 'react';

import Card from '@mui/material/Card';
// import { Button } from '@mui/material';
// import Stack from '@mui/material/Stack';
// import Container from '@mui/material/Container';
import CardHeader from '@mui/material/CardHeader';
// import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

// import Iconify from 'src/components/iconify';
// import { useSnackbar } from 'src/components/snackbar';

// import { useSettingsContext } from 'src/components/settings';

export default function UserList() {
  return (
    <div>
        <Card>
            <CardHeader title="Upload Single File" />
            <CardContent>
              {JSON.stringify(null)}
            </CardContent>
        </Card>
    </div>
  );
}