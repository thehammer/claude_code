import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3005', 10),
  transportMode: (process.env.TRANSPORT_MODE || 'stdio').toLowerCase() as 'stdio' | 'http',
  debug: process.env.DEBUG === 'true',

  // Sentry API
  sentryApiToken: process.env.SENTRY_API_TOKEN || '',
  sentryOrg: process.env.SENTRY_ORG || '',

  get isConfigured(): boolean {
    return !!this.sentryApiToken;
  },

  apiBaseUrl: 'https://sentry.io/api/0',
};
