import jwt from 'jsonwebtoken';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const accessSecret = process.env.JWT_ACCESS_SECRET;
      if (!accessSecret) {
        return res.status(500).json({ message: 'Server Security Configuration Error: JWT Access Secret is missing.' });
      }
      const decoded = jwt.verify(token, accessSecret);
      req.user = decoded;
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};