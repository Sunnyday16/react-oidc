# React Okta OIDC Demo

This project demonstrates how to integrate Okta authentication into a React application using the Authorization Code flow with PKCE. It uses [Vite](https://vitejs.dev/) for tooling and [`@okta/okta-auth-js`](https://github.com/okta/okta-auth-js) for performing the OAuth 2.0/OIDC flow.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a developer account in [Okta](https://developer.okta.com/), register a Web application, and collect the following values:

   - **Client ID**
   - **Issuer** (for example, `https://dev-123456.okta.com/oauth2/default`)
   - **Login redirect URI** (add `http://localhost:3000/login/callback` to the application)

3. Copy the `.env.example` file and fill in your Okta values:

   ```bash
   cp .env.example .env
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the displayed URL (typically `http://localhost:3000`) in your browser and click **Sign in with Okta**.

## What comes next?

Once you have real tokens flowing, the next tasks usually are:

1. Configure your Spring Boot API as an OAuth 2.0 resource server that trusts the same Okta issuer.
2. Add calls from the React app to your protected endpoints using the access token in the `Authorization: Bearer <token>` header.
3. Decide where to host the built React assets (`npm run build`)—either served by Spring Boot itself or via a static host—and update the Okta redirect URIs accordingly.

## Token management

The app uses Okta's token manager to store tokens in `localStorage` by default (configurable via the `VITE_OKTA_TOKEN_STORAGE` variable). After the user signs in, the authorization code returned by Okta is exchanged for ID, access, and refresh tokens, which can be refreshed on demand using the "Refresh tokens" button on the home page.
