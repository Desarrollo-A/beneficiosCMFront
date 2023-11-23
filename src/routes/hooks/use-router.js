import { useMemo } from 'react';
import { useNavigate,useLocation } from 'react-router-dom';
// ----------------------------------------------------------------------

export function useRouter() {
  const navigate = useNavigate();
  const location = useLocation();

  const router = useMemo(
    () => ({
      forward: () => navigate(1),
      reload: () => window.location.reload(),
      push: (href) => navigate(href),
      replace: (href) => navigate(href, { replace: true }),
      state: location.state,
    }),
    [navigate]
  );

  return router;
}
