import { useLocation } from "react-router";

import { Card, Button, CardMedia, Typography, CardActions, CardContent } from "@mui/material";

// import { useSettingsContext } from "src/components/settings";

export default function CalificarCita(){

  // const settings = useSettingsContext();

  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const iCt = searchParams.get('iCt');
console.log(iCt);
  return(
    <Card sx={{ maxWidth: 345 }}>
      <CardMedia
        component="img"
        alt="green iguana"
        height="140"
        image="/static/images/cards/contemplative-reptile.jpg"
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          Lizard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Lizards are a widespread group of squamate reptiles, with over 6,000
          species, ranging across all continents except Antarctica
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small">Share</Button>
        <Button size="small">Learn More</Button>
      </CardActions>
    </Card>
  );
}