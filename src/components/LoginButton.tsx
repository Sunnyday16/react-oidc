import { useAuth } from '../auth/AuthProvider';

const buttonStyle: React.CSSProperties = {
  backgroundColor: '#007dc1',
  color: 'white',
  border: 'none',
  padding: '0.75rem 1.5rem',
  fontSize: '1rem',
  borderRadius: '4px',
  cursor: 'pointer'
};

const LoginButton: React.FC = () => {
  const { isAuthenticated, login } = useAuth();

  if (isAuthenticated) {
    return null;
  }

  return (
    <button type="button" style={buttonStyle} onClick={login}>
      Sign in with Okta
    </button>
  );
};

export default LoginButton;
