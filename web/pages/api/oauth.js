import fetch from "node-fetch";
import jwt from "jsonwebtoken";
import cookie from "cookie";

const { CLIENT_ID, CLIENT_SECRET, APP_URI, COOKIE_NAME, JWT_SECRET } =
  process.env;

const REDIRECT_URI = `${APP_URI}/api/oauth`;
const scope = ["identify"].join(" ");

const OAUTH_QS = new URLSearchParams({
  client_id: CLIENT_ID,
  redirect_uri: REDIRECT_URI,
  response_type: "code",
  scope,
}).toString();

const OAUTH_URI = `https://discord.com/api/oauth2/authorize?${OAUTH_QS}`;

export default async function (req, res) {
  if (req.method !== "GET") return res.redirect("/");

  const { code = null, error = null } = req.query;

  if (error) {
    console.error(error);
    return res.redirect("/");
  }

  if (!code || typeof code !== "string") return res.redirect(OAUTH_URI);

  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: "authorization_code",
    redirect_uri: REDIRECT_URI,
    code,
    scope,
  }).toString();

  const { access_token = null } = await fetch(
    "https://discord.com/api/oauth2/token",
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      method: "POST",
      body,
    }
  ).then((res) => res.json());

  if (!access_token || typeof access_token !== "string") {
    return res.redirect(OAUTH_URI);
  }

  const me = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${access_token}` },
  }).then((res) => res.json());

  if (!("id" in me)) {
    return res.redirect(OAUTH_URI);
  }

  const token = jwt.sign(me, JWT_SECRET, { expiresIn: "24h" });

  res.setHeader(
    "Set-Cookie",
    cookie.serialize(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "lax",
      path: "/",
    })
  );

  res.redirect("/");
}
