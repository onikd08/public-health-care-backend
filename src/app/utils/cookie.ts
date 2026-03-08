import { CookieOptions, Request, Response } from "express";

const getCookie = (req: Request, key: string) => {
  return req.cookies[key];
};

const setCookie = (
  res: Response,
  key: string,
  value: string,
  options: CookieOptions,
) => {
  res.cookie(key, value, options);
};

const clearCookie = (res: Response, key: string, options: CookieOptions) => {
  res.clearCookie(key, options);
};

const setAccessTokenCookie = (res: Response, token: string) => {
  const options: CookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
  };
  setCookie(res, "accessToken", token, options);
};

const setRefreshTokenCookie = (res: Response, token: string) => {
  const options: CookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  };
  setCookie(res, "refreshToken", token, options);
};

const setBetterAuthSessionCookie = (res: Response, token: string) => {
  const options: CookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
  };
  setCookie(res, "better-auth.session_token", token, options);
};

const cookieUtils = {
  getCookie,
  setCookie,
  clearCookie,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  setBetterAuthSessionCookie,
};

export default cookieUtils;
