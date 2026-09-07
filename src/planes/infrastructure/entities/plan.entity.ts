import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('planes')
export class PlanEntity {
  @PrimaryGeneratedColumn('uuid')
  id_plan: number;

  @Column({ type: 'int', unique: true })
  numero_plan: number;

  @Column({ type: 'varchar', length: 100 })
  tipo: string;

  // Almacenar arreglos en bases de datos relacionales (ej. PostgreSQL usa 'simple-array' o 'json')
  @Column({ type: 'simple-array' })
  servicio: string[];

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  precio: number;

  @Column({ type: 'int', default: 0 })
  limite_equipos: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
