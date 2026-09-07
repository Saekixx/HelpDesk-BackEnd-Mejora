import { PlanEntity } from '@/planes/infrastructure/entities/plan.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

// Mantienes tu enum de dominio o lo re-exportas según la convención de tu proyecto
export enum TipoCliente {
  JURIDICA = 'JURIDICA',
  NATURAL = 'NATURAL',
}

@Entity('clientes')
export class ClienteEntity {
  @PrimaryGeneratedColumn('uuid')
  id_cliente: number;

  @Column({
    type: 'enum',
    enum: TipoCliente,
    default: TipoCliente.NATURAL,
  })
  tipo_cliente: TipoCliente;

  @Column({ type: 'varchar', length: 20, unique: true })
  numero_documento: string;

  @Column({ type: 'varchar', length: 255 })
  nombre_principal: string;

  @Column({ type: 'text', nullable: true })
  direccion: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  correo: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  rubro: string;

  @Column({ type: 'date', nullable: true })
  fecha_inicio_plan: Date;

  @Column({ type: 'date', nullable: true })
  fecha_finalizacion_plan: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  costo_negociado: number;

  @Column({ type: 'int', default: 0 })
  limite_equipos_contratado: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'int', nullable: false })
  id_plan: number;

  @ManyToOne(() => PlanEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_plan' })
  plan: PlanEntity;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_registro: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
