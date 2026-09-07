import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SucursalEntity } from './sucursal.entity';

@Entity('area')
export class AreaEntity {
  @PrimaryGeneratedColumn('increment')
  id_area: number;

  @Column({ type: 'varchar', length: 150 })
  nombre_area: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  contacto: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  correo: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'varchar' })
  id_sucursal: number;

  // Relación con SucursalEntity
  @ManyToOne(() => SucursalEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_sucursal' })
  sucursal: SucursalEntity;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
