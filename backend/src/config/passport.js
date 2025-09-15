import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";

import User from "../models/User.js";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        // Try to find existing user by googleId
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // Check if this Google account's email already exists
          user = await User.findOne({ email: profile.emails[0].value });
        }

        if (user) {
          // Link Google account to existing user
          user.googleId = profile.id;
          user.avatar = profile.photos[0]?.value || user.avatar;
          await user.save();
        } else {
          // Create new user
          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            avatar: profile.photos[0]?.value,
          });
        }

        // Return the user to the passport callback route; token/redirect handled in the route.
        return cb(null, user);
      } catch (error) {
        return cb(error, null);
      }
    }
  )
);

export default passport;
