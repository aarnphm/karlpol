import { MiddlewareFn } from 'type-graphql'
import { CustomCtx } from '../types'

export const isAuth: MiddlewareFn<CustomCtx> = ({ context }, next) => {
  if (!context.req.session.userId) {
    throw new Error('not authenticated')
  }

  return next()
}
