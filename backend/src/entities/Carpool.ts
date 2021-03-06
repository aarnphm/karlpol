import { ObjectType, Field } from 'type-graphql'
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  OneToOne,
  JoinColumn
} from 'typeorm'
import { User } from './User'

@ObjectType()
@Entity()
export class Carpool extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number

  @Field()
  @OneToOne(() => User)
  @JoinColumn()
  user: User

  @Field()
  @Column()
  capacity!: number
}
