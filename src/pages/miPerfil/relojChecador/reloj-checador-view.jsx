import { Helmet } from 'react-helmet-async'

import{ useSession } from 'src/hooks/use-session'

import { RelojChecadorView } from 'src/sections/relojChecador'

export default function RelojChecadorPage(){
    useSession()

    return (
        <>
            <Helmet>
                <title>Reloj checador</title>    
            </Helmet>
            <RelojChecadorView />
        </>
    )
}