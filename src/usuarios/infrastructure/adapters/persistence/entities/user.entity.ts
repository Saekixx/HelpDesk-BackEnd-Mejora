// src/usuarios/infrastructure/entities/user.entity.ts

import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RolEntity } from './rol.entity';
import { ClienteEntity } from '@/clientes/infrastructure/adapters/persistence/entities/cliente.entity';
import { SucursalEntity } from '@/clientes/infrastructure/adapters/persistence/entities/sucursal.entity';
import { AreaEntity } from '@/clientes/infrastructure/adapters/persistence/entities/area.entity';

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

  @ManyToOne(() => RolEntity)
  @JoinColumn({ name: 'id_rol' })
  rol: RolEntity;

  @ManyToOne(() => ClienteEntity, { nullable: true })
  @JoinColumn({ name: 'id_cliente' })
  cliente: ClienteEntity | null;

  @ManyToOne(() => SucursalEntity, { nullable: true })
  @JoinColumn({ name: 'id_sucursal' })
  sucursal: SucursalEntity | null;

  @ManyToOne(() => AreaEntity, { nullable: true })
  @JoinColumn({ name: 'id_area' })
  area: AreaEntity | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date;
}
