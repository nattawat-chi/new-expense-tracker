// middleware/auth0.ts
import { auth, ConfigParams, Session } from "express-openid-connect";

const config: ConfigParams = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET || "your_random_secret",
  baseURL: process.env.BASE_URL || "http://localhost:5000",
  clientID: process.env.AUTH0_CLIENT_ID || "YOUR_CLIENT_ID",
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL || "YOUR_ISSUER_BASE_URL",
};

export const auth0Middleware = auth(config);
