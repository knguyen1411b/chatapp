import passport from 'passport'
import { Profile } from 'passport'
import { Strategy as GithubStrategy } from 'passport-github2'
import { Strategy as GoogleStrategy, VerifyCallback } from 'passport-google-oauth20'

import { oauthLogin } from '../services/auth.service'
import { env } from './env'

if (env.googleClientId && env.googleClientSecret) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: env.googleClientId,
                clientSecret: env.googleClientSecret,
                callbackURL: `${env.serverUrl}/api/auth/google/callback`
            },
            async (_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback) => {
                try {
                    const email = profile.emails?.[0]?.value
                    if (!email) return done(new Error('No email from Google'))
                    const auth = await oauthLogin('google', {
                        id: profile.id,
                        email,
                        username: profile.username || email.split('@')[0],
                        avatar: profile.photos?.[0]?.value
                    })
                    return done(null, auth)
                } catch (error) {
                    return done(error as Error)
                }
            }
        )
    )
}

if (env.githubClientId && env.githubClientSecret) {
    passport.use(
        new GithubStrategy(
            {
                clientID: env.githubClientId,
                clientSecret: env.githubClientSecret,
                callbackURL: `${env.serverUrl}/api/auth/github/callback`,
                scope: ['user:email']
            },
            async (_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback) => {
                try {
                    const email = profile.emails?.[0]?.value ?? `${profile.username}@users.noreply.github.com`
                    const auth = await oauthLogin('github', {
                        id: profile.id,
                        email,
                        username: profile.username || email.split('@')[0],
                        avatar: profile.photos?.[0]?.value
                    })
                    return done(null, auth)
                } catch (error) {
                    return done(error as Error)
                }
            }
        )
    )
}

export default passport
