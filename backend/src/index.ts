// import 'reflect-metadata'
import { createConnection } from 'typeorm'
import { __prod__, COOKIE_NAME } from './constants'
import path from 'path'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import Redis from 'ioredis'
import session from 'express-session'
import connectRedis from 'connect-redis'
import cors from 'cors'
import { Carpool } from './entities/Carpool'
import { Itinerary } from './entities/Itinerary'
import { User } from './entities/User'
import { Wallet } from './entities/Wallet'

const main = async () => {
  const conn = await createConnection({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    logging: true,
    migrations: [path.join(__dirname, './migration/*')],
    entities: [Carpool, Itinerary, User, Wallet]
  })

  const app = express()

  const RedisStore = connectRedis(session)
  const redis = new Redis(process.env.REDIS_URL)
  app.set('trust proxy', 1)
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true
    })
  )

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true
      }),
      cookie: {
        maxAge: 1000 * 60 * 30,
        httpOnly: true,
        sameSite: 'lax',
        secure: __prod__,
        domain: __prod__ ? '' : undefined //enter domain here
      },
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET,
      resave: false
    })
  )

  const apolloServer = new ApolloServer({
      schema: await buildSchema({
          resolvers: [UserResolver],
          validate: false,
      })
  })
}

main().catch((err) => {
  console.error(err)
})
