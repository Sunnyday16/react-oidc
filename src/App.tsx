import { useAuth } from './auth/AuthProvider';
import { Routes, Route, Link } from 'react-router-dom';
import LoginCallback from './pages/LoginCallback';
import LoginButton from './components/LoginButton';

function Home() {
  const { isAuthenticated, idToken, accessToken, refreshToken, logout, renewTokens } = useAuth();

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '720px', margin: '3rem auto' }}>
      <h1>React Okta OIDC Demo</h1>
      <p>
        This demo shows a minimal Okta authorization code flow with PKCE using the Okta Auth JS SDK.
      </p>
      <LoginButton />
      {isAuthenticated && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Token details</h2>
          <p>You are logged in. Use the buttons below to manage your session.</p>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <button onClick={renewTokens}>Refresh tokens</button>
            <button onClick={logout}>Log out</button>
          </div>
          <section>
            <h3>ID token</h3>
            <pre style={{ background: '#f5f5f5', padding: '1rem', overflow: 'auto' }}>
              {JSON.stringify(idToken?.claims ?? {}, null, 2)}
            </pre>
          </section>
          <section>
            <h3>Access token</h3>
            <pre style={{ background: '#f5f5f5', padding: '1rem', overflow: 'auto' }}>
              {accessToken?.accessToken ?? 'Missing access token'}
            </pre>
          </section>
          <section>
            <h3>Refresh token</h3>
            <pre style={{ background: '#f5f5f5', padding: '1rem', overflow: 'auto' }}>
              {refreshToken?.refreshToken ?? 'Missing refresh token'}
            </pre>
          </section>
        </div>
      )}
      <p style={{ marginTop: '2rem' }}>
        Need to trigger the redirect callback manually? Visit{' '}
        <Link to="/login/callback">/login/callback</Link>.
      </p>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login/callback" element={<LoginCallback />} />
    </Routes>
  );
}

export default App;
