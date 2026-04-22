import { Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";
import { AuthRequest, UserRole } from "../types";

/**
 * Extracts JWT from Authorization header and attaches user to req.user.
 * Throws 401 if missing or invalid.
 */
export function requireAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(ApiError.unauthorized("Missing or invalid Authorization header"));
  }

  const token = header.slice("Bearer ".length).trim();
  try {
    const user = verifyToken(token);
    req.user = user;
    next();
  } catch {
    next(ApiError.unauthorized("Invalid or expired token"));
  }
}

/**
 * Role-based access control. Pass one or more roles; user must match at least one.
 *   requireRole('admin')            -> admin only
 *   requireRole('admin', 'user')    -> either role
 */
export function requireRole(...roles: UserRole[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Requires role: ${roles.join(" or ")} (you are '${req.user.role}')`
        )
      );
    }
    next();
  };
}

/** Shortcut: admin only */
export const requireAdmin = [requireAuth, requireRole("admin")];

/** Shortcut: any authenticated user */
export const requireUser = [requireAuth, requireRole("admin", "user")];
