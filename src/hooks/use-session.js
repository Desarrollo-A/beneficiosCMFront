import { useEffect } from "react"
import { useNavigate } from 'react-router-dom';

import { useAuthContext } from 'src/auth/hooks';

// import { useGetUserData } from 'src/api/user';

export function useSession() {
    const navigate = useNavigate();
    const { check, authenticated } = useAuthContext();

    useEffect(() => {
        check()

        if(!authenticated){
            navigate('/')
        }

    }, [check, authenticated, navigate]);

    return null;
}