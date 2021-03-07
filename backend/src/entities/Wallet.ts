import {
  Entity,
  OneToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity
} from 'typeorm'
import { User } from './User'

@Entity()
export class Wallet extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  password!: number

  @OneToOne(() => User)
  @JoinColumn()
  user: User

  @Column()
  transaction: number
}
