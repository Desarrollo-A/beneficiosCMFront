import { useEffect } from "react"
import { useNavigate } from 'react-router-dom';

import { paths } from 'src/routes/paths';

import { useAuthContext } from 'src/auth/hooks';
import { useGetAuthorized } from 'src/api/user';

export function useSession() {
    const navigate = useNavigate();
    const { authenticated } = useAuthContext();
    const { authorized, authorizedLoading } = useGetAuthorized();

   // const [needFetching, setNeedFetching] = useState(false)
   // const [checked, setChecked] = useState(false)

    useEffect(() => {
        // if(!checked){
        //     setNeedFetching(true)
        // }

        if(!authenticated){
            navigate(paths.auth.jwt.login)
        }

        if(authorizedLoading && authorized){
            navigate(paths.dashboard.general.dash)
        }

    }, [authenticated, authorized, authorizedLoading, navigate]);

    // useEffect(() => {
    //     //if (!needFetching) return;

    //     if(!authorized){
    //         navigate(paths.dashboard.general.dash)
    //     }

    //     //setChecked(true)
        
    // }, [authorized])

    return null;
}