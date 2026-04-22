import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { AuthUser } from "../types";

export function signToken(user: AuthUser): string {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
  const options: SignOptions = { expiresIn: env.jwt.expiresIn as SignOptions["expiresIn"] };
  return jwt.sign(payload, env.jwt.secret, options);
}

export function verifyToken(token: string): AuthUser {
  const decoded = jwt.verify(token, env.jwt.secret) as AuthUser & { iat: number; exp: number };
  return {
    id: decoded.id,
    email: decoded.email,
    name: decoded.name,
    role: decoded.role,
  };
}
