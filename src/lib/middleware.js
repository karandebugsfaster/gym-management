import { verifyToken } from './jwt';
import User from '@/models/User';
import dbConnect from './dbConnect';

/**
 * Verify authentication from request headers
 */
export async function verifyAuth(request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { authenticated: false, user: null, error: 'No token provided' };
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return { authenticated: false, user: null, error: 'Invalid token' };
    }

    // Connect to database
    await dbConnect();
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return { authenticated: false, user: null, error: 'User not found or inactive' };
    }

    return { authenticated: true, user, error: null };
  } catch (error) {
    return { authenticated: false, user: null, error: error.message };
  }
}

/**
 * Get user ID from token (lightweight, no DB query)
 */
export function getUserIdFromToken(request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    return decoded?.userId || null;
  } catch (error) {
    return null;
  }
}