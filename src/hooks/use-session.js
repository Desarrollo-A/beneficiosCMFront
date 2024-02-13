import { useEffect } from "react"
import { useNavigate, useLocation } from 'react-router-dom';

import { paths } from 'src/routes/paths';

import { useAuthContext } from 'src/auth/hooks';
import { useGetAuthorized } from 'src/api/user';

export function useSession() {
    const navigate = useNavigate();
    const { authenticated, loading } = useAuthContext();
    const { authorized, authorizedLoading } = useGetAuthorized();

    let location = useLocation();

    const except = [
        paths.auth.jwt.login,
        paths.auth.jwt.register,
        paths.auth.jwt.preRegister
    ]

    useEffect(() => {

        if(!loading && !authenticated){
            if(!except.includes(location.pathname)){
                navigate(paths.auth.jwt.login)
            }
        }

        if(authorizedLoading && authorized){
            navigate(paths.dashboard.general.dash)
        }

    }, [authenticated, authorized, authorizedLoading, navigate, loading, location]);

    return null;
}