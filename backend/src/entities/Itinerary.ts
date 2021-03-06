import { Entity, Generated, PrimaryColumn, Column, BaseEntity } from 'typeorm'
import { Geometry } from 'geojson'

@Entity()
export class Itinerary extends BaseEntity {
  @Column({ type: 'int' })
  @Generated('uuid')
  id!: number

  @PrimaryColumn()
  userId: number

  @Column({ type: 'timestamp' })
  leaveTime: Date

  @Column()
  location: Geometry

  @Column()
  destination: Geometry
}
