import { useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom';

import { useAuthContext } from 'src/auth/hooks';

// import { useGetUserData } from 'src/api/user';

export function useSession() {
    const navigate = useNavigate();
    const { check, authenticated } = useAuthContext();

    const [needFetching, setNeedFetching] = useState(false)
    const [checked, setChecked] = useState(false)

    useEffect(() => {
        if(!checked){
            setNeedFetching(true)
        }

        if(!authenticated){
            navigate('/')
        }
    }, [checked, authenticated, navigate]);

    useEffect(() => {
        if (!needFetching) return;

        check()

        setChecked(true)
        
    }, [check, needFetching])

    return null;
}