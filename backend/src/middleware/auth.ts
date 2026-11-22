import { NextFunction, Request, Response } from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { env } from '../config/env';
import { createUserSupabaseClient, supabaseAnon } from '../config/supabase';
import { AuthContext } from '../types/express';
import { AppError } from './errorHandler';

const jwksUrl = new URL(`${env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`);
const remoteJwks = createRemoteJWKSet(jwksUrl);

function extractBearerToken(authorizationHeader?: string): string | null {
  if (!authorizationHeader) {
    return null;
  }

  const parts = authorizationHeader.trim().split(/\s+/);
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer' || !parts[1]) {
    return null;
  }

  return parts[1];
}

async function verifySupabaseJwt(token: string): Promise<AuthContext> {
  // Primary verification using @supabase/supabase-js getClaims() (supports asymmetric keys & JWKS cache)
  try {
    const { data, error } = await supabaseAnon.auth.getClaims(token);
    if (!error && data?.claims?.sub) {
      const claims = data.claims as Record<string, unknown>;
      return {
        userId: String(claims.sub),
        email: typeof claims.email === 'string' ? claims.email : undefined,
        role: typeof claims.role === 'string' ? claims.role : undefined,
        accessToken: token,
      };
    }

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('expired')) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication token has expired.');
      }
      if (msg.includes('invalid') || msg.includes('malformed') || msg.includes('signature')) {
        throw new AppError(401, 'UNAUTHORIZED', 'Invalid authentication token.');
      }
    }
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    // Fall through to direct remote JWKS verification via jose
  }

  // Fallback: direct JWKS verification against Supabase Auth well-known endpoint
  try {
    const { payload } = await jwtVerify(token, remoteJwks, {
      issuer: `${env.SUPABASE_URL}/auth/v1`,
    });

    if (!payload.sub) {
      throw new AppError(401, 'UNAUTHORIZED', 'Token is missing subject claim.');
    }

    return {
      userId: payload.sub,
      email: typeof payload.email === 'string' ? payload.email : undefined,
      role: typeof payload.role === 'string' ? payload.role : undefined,
      accessToken: token,
    };
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError(
      401,
      'UNAUTHORIZED',
      'Invalid or expired authentication token.'
    );
  }
}

/**
 * Protects private routes by requiring a valid Supabase Auth Bearer JWT.
 * Populates `req.auth` and `req.supabase` (user-scoped RLS client).
 */
export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractBearerToken(req.headers.authorization);
    if (!token) {
      next(
        new AppError(
          401,
          'UNAUTHORIZED',
          'Missing or malformed Authorization Bearer token.'
        )
      );
      return;
    }

    const authContext = await verifySupabaseJwt(token);
    req.auth = authContext;
    req.supabase = createUserSupabaseClient(token);
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Optionally authenticates requests that include a Bearer token,
 * leaving `req.auth` undefined when no Authorization header is sent.
 */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      next();
      return;
    }

    const token = extractBearerToken(authHeader);
    if (!token) {
      next(
        new AppError(
          401,
          'UNAUTHORIZED',
          'Malformed Authorization header. Expected "Bearer <token>".'
        )
      );
      return;
    }

    const authContext = await verifySupabaseJwt(token);
    req.auth = authContext;
    req.supabase = createUserSupabaseClient(token);
    next();
  } catch (error) {
    next(error);
  }
}
