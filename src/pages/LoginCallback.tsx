import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import oktaAuthService from '../auth/OktaAuthService';

const LoginCallback: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function processRedirect() {
      try {
        await oktaAuthService.handleRedirectFromOkta(window.location.href);
        navigate('/', { replace: true });
      } catch (err) {
        setError((err as Error).message);
      }
    }

    void processRedirect();
  }, [navigate]);

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '720px', margin: '3rem auto' }}>
      <h1>Completing sign in…</h1>
      <p>Processing the authorization code returned from Okta.</p>
      <pre style={{ background: '#f5f5f5', padding: '1rem', overflow: 'auto' }}>{location.search}</pre>
      {error && (
        <div style={{ marginTop: '1rem', color: 'red' }}>
          <strong>Authentication failed:</strong> {error}
        </div>
      )}
    </div>
  );
};

export default LoginCallback;
