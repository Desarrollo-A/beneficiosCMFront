import { Helmet } from "react-helmet-async";

import { AgendaView } from "src/sections/overview/agenda";

export default function AgendaPage(){
    return(
        <>
        <Helmet>
            <title>Agenda presencial</title>
        </Helmet>

        <AgendaView />
        </>
    );
}