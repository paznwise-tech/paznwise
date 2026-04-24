'use strict';

const { OAuth2Client } = require('google-auth-library');
const axios            = require('axios');
const AppError         = require('./AppError');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Verifies a Google ID Token.
 * 
 * @param {string} idToken 
 * @returns {Promise<{ email: string, providerId: string, name: string, picture: string }>}
 */
const verifyGoogleToken = async (idToken) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) throw new AppError('Invalid Google token payload.', 401);

    return {
      email:      payload.email,
      providerId: payload.sub,
      name:       payload.name,
      picture:    payload.picture,
    };
  } catch (error) {
    console.error('[SocialAuthHelper] Google verification error:', error.message);
    throw new AppError('Failed to verify Google token.', 401);
  }
};

/**
 * Verifies a Facebook Access Token via Graph API.
 * 
 * @param {string} accessToken 
 * @returns {Promise<{ email: string|null, providerId: string, name: string }>}
 */
const verifyFacebookToken = async (accessToken) => {
  try {
    const { data } = await axios.get(`https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`);

    if (!data || !data.id) {
      throw new AppError('Invalid Facebook token response.', 401);
    }

    return {
      email:      data.email || null, // FB might not return email
      providerId: data.id,
      name:       data.name,
    };
  } catch (error) {
    console.error('[SocialAuthHelper] Facebook verification error:', error.response?.data || error.message);
    throw new AppError('Failed to verify Facebook token.', 401);
  }
};

module.exports = {
  verifyGoogleToken,
  verifyFacebookToken,
};
