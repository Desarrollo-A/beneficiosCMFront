import { Helmet } from "react-helmet-async";

import { CalendarioView } from "src/sections/overview/calendarioespecialista/view";

export default function CalendarioPage(){
    return(
        <>
        <Helmet>
            <title>Calendario</title>
        </Helmet>

        <CalendarioView />
        </>
    );
}