import { sign, verify } from "hono/jwt";

export function generateAccessToken(
  id: string,
  email: string,
  jwtSecret: string,
) {
  const payload = {
    sub: id,
    email: email,
    exp: Math.floor(Date.now() / 1000) + 60 * 5,
  };
  return sign(payload, jwtSecret);
}

export function verifyToken(tokenToVerify: string, jwtSecret: string) {
  return verify(tokenToVerify, jwtSecret);
}
