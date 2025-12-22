import { Entity, Column } from 'typeorm';
import { BasicInformationEntity } from 'src/common/base/entities';

@Entity({ name: 'configuration', schema: 'config' })
export class Configuration extends BasicInformationEntity {
  @Column({ unique: true })
  from: string;

  @Column()
  notification_time: number;

  @Column({ unique: true })
  mail_user: string;

  @Column({ unique: true })
  mail_port: string;

  @Column({ unique: true })
  mail_pass: string;

  @Column({ unique: true })
  mail_host: string;

  @Column()
  reset_pswd: number;
}
