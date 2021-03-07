import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  OneToOne,
  JoinColumn
} from 'typeorm'
import { User } from './User'

@Entity()
export class Carpool extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @OneToOne(() => User, (user) => user.id)
  @JoinColumn()
  user: User

  @Column()
  capacity!: number
}
