import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthRequest } from '../middleware/auth.middleware';
import * as R from '../utils/response';

const authService = new AuthService();

export async function register(req: Request, res: Response) {
  try {
    const result = await authService.register(req.body);
    return R.created(res, result, 'Account created successfully');
  } catch (err) {
    if (err instanceof Error && err.message === 'DUPLICATE_EMAIL') {
      return R.conflict(res, 'An account with this email already exists');
    }
    return R.serverError(res);
  }
}

export async function login(req: Request, res: Response) {
  try {
    const result = await authService.login(req.body);
    return R.ok(res, result, 'Login successful');
  } catch (err) {
    if (err instanceof Error && err.message === 'INVALID_CREDENTIALS') {
      return R.unauthorized(res, 'Invalid email or password');
    }
    return R.serverError(res);
  }
}

export async function getMe(req: AuthRequest, res: Response) {
  try {
    const user = await authService.getMe(req.user!.userId);
    if (!user) return R.notFoundResponse(res, 'User not found');
    return R.ok(res, user);
  } catch {
    return R.serverError(res);
  }
}
