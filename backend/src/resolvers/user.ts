import { User } from '../entities/User'
import {
  Resolver,
  Root,
  FieldResolver,
  ObjectType,
  Field,
  Ctx
} from 'type-graphql'
import { CustomCtx } from '../types'
import argon2 from 'argon2'
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from '../constants'
import { UsernamePasswordInput } from './UsernamePasswordInput'
import { validateRegister } from '../utils/validateRegister'
import { sendEmail } from '../utils/sendEmail'
import { v4 } from 'uuid'
import { getConnection } from 'typeorm'

@ObjectType()
class FieldError {
  @Field()
  field: string
  @Field()
  message: string
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[]
  @Field(() => User, { nullable: true })
  user?: User
}

@Resolver(User)
export class UserResolver {
  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { req }: CustomCtx) {
    // current user email and show them their email
    if (req.session.userId === user.id) {
      return user.email
    }

    return ''
  }
}
