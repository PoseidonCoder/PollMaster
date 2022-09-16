import { parse } from "cookie";
import { verify } from "jsonwebtoken";

export function parseUser({ headers: { cookie } }) {
  const { JWT_SECRET, COOKIE_NAME } = process.env;

  if (!cookie) return null;

  const token = parse(cookie)[COOKIE_NAME];

  if (!token) return null;

  try {
    return verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}
