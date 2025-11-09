interface OktaConfig {
  clientId: string;
  issuer: string;
  redirectUri: string;
  scopes: string[];
  tokenStorage: 'localStorage' | 'sessionStorage';
}

const oktaConfig: OktaConfig = {
  clientId: import.meta.env.VITE_OKTA_CLIENT_ID ?? 'your-okta-client-id',
  issuer: import.meta.env.VITE_OKTA_ISSUER ?? 'https://your-okta-domain.okta.com/oauth2/default',
  redirectUri: import.meta.env.VITE_OKTA_REDIRECT_URI ?? `${window.location.origin}/login/callback`,
  scopes: (import.meta.env.VITE_OKTA_SCOPES ?? 'openid profile email offline_access').split(' '),
  tokenStorage: (import.meta.env.VITE_OKTA_TOKEN_STORAGE as OktaConfig['tokenStorage']) ?? 'localStorage'
};

export default oktaConfig;
