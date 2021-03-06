import { User } from "../entities/User";
import {Resolver, Root, FieldResolver, ObjectType, Field} from "type-graphql";

@ObjectType()
class FieldError {
    @Field()
    field: string;
    @Field()
    message: string;
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[]
    @Field(()=> User, {nullable:true})
    user?: User;
}

@Resolver(User)
export class UserResolver{
    @FieldResolver(()=>String)
    email(@Root() user: User, @Ctx(){ req }: CustomCtx){
        // current user email and show them their email
        if (req.session.userId === user.id){
            return user.email;
        }

        return "";
    }
}
