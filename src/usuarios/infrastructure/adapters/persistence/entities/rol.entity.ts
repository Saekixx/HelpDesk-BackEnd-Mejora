import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('rol')
export class RolEntity {
  @PrimaryGeneratedColumn()
  id_rol: number;

  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
