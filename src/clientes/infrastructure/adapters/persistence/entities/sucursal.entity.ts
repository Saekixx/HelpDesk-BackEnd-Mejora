import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ClienteEntity } from './cliente.entity';

@Entity('sucursales')
export class SucursalEntity {
  @PrimaryGeneratedColumn('uuid')
  id_sucursal: number;

  @Column({ type: 'varchar', length: 150 })
  nombre_sucursal: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  encargado: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono: string;

  @Column({ type: 'text', nullable: true })
  direccion: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  correo: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'int' })
  id_cliente: number;

  // Relación con ClienteEntity
  @ManyToOne(() => ClienteEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_cliente' })
  cliente: ClienteEntity;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date;
}
