import { Helmet } from "react-helmet-async";

import { OverviewTestView } from "src/sections/overview/test/view";

export default function OverviewTestPage(){
    return(
        <>
        <Helmet>
            <title>Dashboard: Test</title>
        </Helmet>

        <OverviewTestView />
        </>
    );
}