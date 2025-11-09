import { OktaAuth, TokenCollection, TokenParams, TokenResponse, Tokens } from '@okta/okta-auth-js';
import oktaConfig from '../config/oktaConfig';

type TokenKey = 'idToken' | 'accessToken' | 'refreshToken';

type TokenSubscriber<T> = (token: T | null) => void;

class OktaAuthService {
  private oktaAuth: OktaAuth;

  constructor() {
    this.oktaAuth = new OktaAuth({
      clientId: oktaConfig.clientId,
      issuer: oktaConfig.issuer,
      redirectUri: oktaConfig.redirectUri,
      scopes: oktaConfig.scopes,
      pkce: true,
      tokenManager: {
        storage: oktaConfig.tokenStorage,
        autoRenew: true,
        autoRemove: true
      }
    });
  }

  public login = async (): Promise<void> => {
    const params: TokenParams = {
      scopes: oktaConfig.scopes,
      responseType: ['code'],
      prompt: 'login'
    };

    await this.oktaAuth.token.getWithRedirect(params);
  };

  public logout = async (): Promise<void> => {
    await this.oktaAuth.signOut({ revokeAccessToken: true, revokeRefreshToken: true });
  };

  public async handleRedirectFromOkta(url?: string): Promise<TokenResponse> {
    const transaction = await this.oktaAuth.token.parseFromUrl(url);

    const tokens = transaction.tokens as TokenCollection;
    const storedTokens: Tokens = {};

    if (tokens.accessToken) {
      storedTokens.accessToken = tokens.accessToken;
    }
    if (tokens.idToken) {
      storedTokens.idToken = tokens.idToken;
    }
    if (tokens.refreshToken) {
      storedTokens.refreshToken = tokens.refreshToken;
    }

    await this.oktaAuth.tokenManager.setTokens(storedTokens);

    return transaction;
  }

  public async getTokens(): Promise<TokenCollection | null> {
    const [accessToken, idToken, refreshToken] = await Promise.all([
      this.oktaAuth.tokenManager.get('accessToken'),
      this.oktaAuth.tokenManager.get('idToken'),
      this.oktaAuth.tokenManager.get('refreshToken')
    ]);

    if (!accessToken && !idToken && !refreshToken) {
      return null;
    }

    return {
      accessToken: accessToken ?? undefined,
      idToken: idToken ?? undefined,
      refreshToken: refreshToken ?? undefined
    };
  }

  public subscribeToTokenChanges<T extends TokenCollection[TokenKey]>(
    key: TokenKey,
    callback: TokenSubscriber<T>
  ): (() => void) | undefined {
    const handleAdded = (addedKey: string, token: unknown) => {
      if (addedKey === key) {
        callback((token as T) ?? null);
      }
    };

    const handleRenewed = (renewedKey: string, token: unknown) => {
      if (renewedKey === key) {
        callback((token as T) ?? null);
      }
    };

    const handleRemoved = (removedKey: string) => {
      if (removedKey === key) {
        callback(null);
      }
    };

    this.oktaAuth.tokenManager.on('added', handleAdded);
    this.oktaAuth.tokenManager.on('renewed', handleRenewed);
    this.oktaAuth.tokenManager.on('removed', handleRemoved);

    return () => {
      this.oktaAuth.tokenManager.off('added', handleAdded);
      this.oktaAuth.tokenManager.off('renewed', handleRenewed);
      this.oktaAuth.tokenManager.off('removed', handleRemoved);
    };
  }

  public async renewTokens(): Promise<TokenCollection> {
    const [renewedAccessToken, renewedIdToken] = await Promise.all([
      this.oktaAuth.tokenManager.renew('accessToken'),
      this.oktaAuth.tokenManager.renew('idToken')
    ]);
    const refreshToken = await this.oktaAuth.tokenManager.get('refreshToken');

    const tokensToStore: Tokens = {};
    if (renewedAccessToken) {
      tokensToStore.accessToken = renewedAccessToken;
    }
    if (renewedIdToken) {
      tokensToStore.idToken = renewedIdToken;
    }
    if (refreshToken) {
      tokensToStore.refreshToken = refreshToken;
    }

    await this.oktaAuth.tokenManager.setTokens(tokensToStore);

    return {
      accessToken: (renewedAccessToken ?? (await this.oktaAuth.tokenManager.get('accessToken'))) ?? undefined,
      idToken: (renewedIdToken ?? (await this.oktaAuth.tokenManager.get('idToken'))) ?? undefined,
      refreshToken: refreshToken ?? undefined
    };
  }
}

const oktaAuthService = new OktaAuthService();
export default oktaAuthService;
