import { Helmet } from "react-helmet-async";

import { useSession } from 'src/hooks/use-session';

import { CalendarioView } from "src/sections/overview/calendarioespecialista/view";

export default function CalendarioPage(){
    useSession();
    return(
        <>
        <Helmet>
            <title>Calendario</title>
        </Helmet>

        <CalendarioView />
        </>
    );
}