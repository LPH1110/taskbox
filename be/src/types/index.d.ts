import { Profile } from "@prisma/client";

declare global {
  namespace Express {
    interface User extends Profile {}
    interface Request {
      user?: User;
    }
  }
}
