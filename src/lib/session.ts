// this file is a wrapper with defaults to be used in both API routes and `getServerSideProps` functions
import type { SessionOptions } from "iron-session";

import { env } from "~/env";

export type UserSession = {
  id: string;
  avatarUrl: string;
};

export const sessionOptions: SessionOptions = {
  password: env.COOKIE_SECRET,
  cookieName: "statagems",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

// This is where we specify the typings of req.session.*
declare module "iron-session" {
  interface IronSessionData {
    user: UserSession;
  }
}
