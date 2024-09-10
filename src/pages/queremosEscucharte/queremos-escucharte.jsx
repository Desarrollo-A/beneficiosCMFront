import { Helmet } from 'react-helmet-async';

import { QueremosEscucharteView } from 'src/sections/queremosEscucharte/';

// ----------------------------------------------------------------------

export default function QueremosEscucharte() {
  return (
    <>
      <Helmet>
        <title> Queremos escucharte</title>
      </Helmet>

      <QueremosEscucharteView />
    </>
  );
}