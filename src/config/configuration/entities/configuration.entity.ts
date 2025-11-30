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

  @Column({ unique: true })
  ldap_url: string;

  @Column({ unique: true })
  ldaap_bind_dn: string;

  @Column({ unique: true })
  ldap_bind_password: string;

  @Column({ unique: true })
  ldap_base_dn: string;

  @Column({ unique: true })
  ldap_time_out: number;

  @Column()
  ldap_tls: boolean;

  @Column()
  ldap_tls_reject_unathorized: boolean;

  @Column({ unique: true })
  ldap_domain: string;

  @Column({ unique: true })
  ldap_users_ou: string;
}
