import { Helmet } from "react-helmet-async";

import { useSession } from 'src/hooks/use-session';

import { CalendarView } from "src/sections/calendar";

export default function CalendarioPage(){
    useSession()
    
    return(
        <>
            <Helmet>
                <title>Calendario</title>
            </Helmet>

            <CalendarView />
        </>
    );
}