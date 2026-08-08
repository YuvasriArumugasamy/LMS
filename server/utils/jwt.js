import jwt from 'jsonwebtoken';

export const generateTokens = (user) => {
  const payload = {
    id: user._id || user.id,
    email: user.email,
    role: user.role,
    employeeId: user.employeeId,
    name: `${user.firstName} ${user.lastName}`
  };

  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET || 'super_secret_enterprise_jwt_access_key_2026_9988776655',
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );

  const refreshToken = jwt.sign(
    { id: payload.id },
    process.env.JWT_REFRESH_SECRET || 'super_secret_enterprise_jwt_refresh_key_2026_1122334455',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'super_secret_enterprise_jwt_access_key_2026_9988776655');
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'super_secret_enterprise_jwt_refresh_key_2026_1122334455');
};
