import { Request, Response } from 'express'
import { Redis } from 'ioredis'
import { createUserLoader } from './utils/createUserLoader'

export type CustomCtx = {
  req: Request & { session: {userId: string} }
  redis: Redis
  res: Response
  userLoader: ReturnType<typeof createUserLoader>
}
