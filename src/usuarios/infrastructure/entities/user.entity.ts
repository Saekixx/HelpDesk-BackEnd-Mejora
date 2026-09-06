import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('usuarios')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id_usuario: number;

  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  @Column({ type: 'varchar', length: 150 })
  apellido: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  correo: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 20 })
  telefono: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'int' })
  id_rol: number;

  @Column({ type: 'int', nullable: true })
  id_cliente: number | null;

  @Column({ type: 'int', nullable: true })
  id_sucursal: number | null;

  @Column({ type: 'int', nullable: true })
  id_area: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
