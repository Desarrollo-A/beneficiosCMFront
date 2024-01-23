import { useEffect } from "react"
import { useNavigate } from 'react-router-dom';

import { useAuthContext } from 'src/auth/hooks';

// import { useGetUserData } from 'src/api/user';

export function useSession() {
    const navigate = useNavigate();
    const { user, authenticated, loading } = useAuthContext();

    useEffect(() => {
        if(!authenticated){
            navigate('/')
        }
    }, [user, authenticated, navigate, loading]);

    return null;
}