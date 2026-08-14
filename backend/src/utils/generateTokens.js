import jwt from 'jsonwebtoken';

export const generateTokens = (res, userId) => {
  const accessSecret = process.env.JWT_ACCESS_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;

  if (!accessSecret || !refreshSecret) {
    throw new Error('FATAL SECURITY EXCEPTION: JWT Access and/or Refresh secret environment variables are not defined.');
  }

  const accessToken = jwt.sign({ id: userId }, accessSecret, {
    expiresIn: '15m'
  });

  const refreshToken = jwt.sign({ id: userId }, refreshSecret, {
    expiresIn: '7d'
  });

  // Store Refresh Token in HTTP-Only Cookie (XSS Protection)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 Days
  });

  return accessToken;
};


