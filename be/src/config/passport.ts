import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "../lib/prisma";
import { env } from "./env";

// JWT Strategy Options
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: env.JWT_SECRET,
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      const profile = await prisma.profile.findUnique({
        where: { id: payload.id },
      });

      if (profile) {
        return done(null, profile);
      }
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  })
);

// Google OAuth Strategy
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_CALLBACK_URL) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0].value;
          if (!email) {
            return done(new Error("No email found in Google profile"), false);
          }

          // Check if profile exists
          let userProfile = await prisma.profile.findUnique({
            where: { email },
          });

          if (!userProfile) {
            // Create user
            const slug = `${email.split("@")[0]}-personal-${Math.random().toString(36).substring(2, 6)}`;
            userProfile = await prisma.profile.create({
              data: {
                email,
                full_name: profile.displayName,
                avatar_url: profile.photos?.[0]?.value,
                provider: "google",
                workspaces: {
                  create: {
                    name: "Personal Workspace",
                    slug,
                  },
                },
              },
            });
          }

          return done(null, userProfile);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );
}

export default passport;
