import { ObjectType, Field, Int } from 'type-graphql'
import {
  Entity,
  OneToMany,
  JoinColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Column,
  UpdateDateColumn,
  BaseEntity,
  OneToOne
} from 'typeorm'
import { Itinerary } from './Itinerary'
import { Carpool } from './Carpool'
import { Wallet } from './Wallet'

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number

  @Field(() => String)
  @Column({ unique: true })
  username!: string

  @Field(() => String)
  @Column({ unique: true })
  email!: string

  @Column({ type: "text" })
  password!: string

  @OneToMany(() => Itinerary, (itinerary) => itinerary.id)
  itinerary: Itinerary[]

  @OneToOne(() => Carpool)
  @JoinColumn()
  carpool: Carpool

  @OneToOne(() => Wallet)
  @JoinColumn()
  wallet: Wallet

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date
}
