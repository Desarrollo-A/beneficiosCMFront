import PropTypes from 'prop-types';
import { useMemo, useEffect, useReducer, useCallback } from 'react';

import instance from 'src/utils/axiosBack';
import axios, { endpoints, fetcherGet } from 'src/utils/axios';

import { HOST } from 'src/config-global';

import { AuthContext } from './auth-context';
import { setSession, isValidToken } from './utils';
// ----------------------------------------------------------------------

// NOTE:
// We only build demo at basic level.
// Customer will need to do some extra handling yourself if you want to extend the logic and other features...

// ----------------------------------------------------------------------

const initialState = {
  user: null,
  loading: true,
};

const reducer = (state, action) => {
  if (action.type === 'INITIAL') {
    return {
      loading: false,
      user: action.payload.user,
    };
  }
  if (action.type === 'LOGIN') {
    return {
      ...state,
      user: action.payload.user,
    };
  }
  if (action.type === 'REGISTER') {
    return {
      ...state,
      user: action.payload.user,
    };
  }
  if (action.type === 'LOGOUT') {
    return {
      ...state,
      user: null,
    };
  }
  return state;
};

// ----------------------------------------------------------------------

const STORAGE_KEY = 'accessToken';

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const initialize = useCallback(async () => {
    try {
      const accessToken = sessionStorage.getItem(STORAGE_KEY);
      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken);

        const url = `${HOST}${endpoints.auth.me}`;

        const config = {
          headers: {
            token: accessToken,
          },
        };

        const response = await fetcherGet([url, config]);

        const { user } = response;

        dispatch({
          type: 'INITIAL',
          payload: {
            user: {
              ...user,
              accessToken,
            },
          },
        });
      } else {
        dispatch({
          type: 'INITIAL',
          payload: {
            user: null,
          },
        });
      }
    } catch (error) {
      dispatch({
        type: 'INITIAL',
        payload: {
          user: null,
        },
      });
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // LOGIN
  const login = useCallback(async (numempleado, password) => {
    const data = JSON.stringify({ numempleado, password });

    const url = `${HOST}${endpoints.auth.login}`;

    const response = await instance.post(url, data);

    if (response.data.result === 1) {
      const { accessToken, user } = response.data;
      setSession(accessToken);

      dispatch({
        type: 'LOGIN',
        payload: {
          user: {
            ...user,
            accessToken,
          },
        },
      });
    } else {
      return { result: 0, message: 'El usuario y/o contraseña no son correctos' };
    }
  }, []);

  // REGISTER
  const register = useCallback(async (numEmpleado) => {
    const data = {
      numEmpleado,
    };

    const response = await axios.post(
      'https://prueba.gphsis.com/RHCV/index.php/WS/info_empleado',
      data
    );

    const { accessToken, user } = response.data;

    sessionStorage.setItem(STORAGE_KEY, accessToken);

    dispatch({
      type: 'REGISTER',
      payload: {
        user: {
          ...user,
          accessToken,
        },
      },
    });
  }, []);

  // LOGOUT
  const logout = useCallback(async () => {
    setSession(null);

    const response = await instance.post(endpoints.auth.logout);
    dispatch({
      type: 'LOGOUT',
    });
  }, []);

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user,
      method: 'jwt',
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
      //
      login,
      register,
      logout,
      check: initialize,
    }),
    [login, logout, register, state.user, status]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};
