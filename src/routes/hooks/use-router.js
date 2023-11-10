import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// ----------------------------------------------------------------------

export function useRouter() {
  const navigate = useNavigate();
  const router = useMemo(
    () => ({
      forward: () => navigate(1),
      reload: () => window.location.reload(),
      push: (href) => navigate(href),
      replace: (href) => navigate(href, { replace: true }),
    }),
    [navigate]
  );

  return router;
}
