import { BasicEntity } from "../../../common/base/entities";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { notifyEnum } from "./../../../common/enum/notify.enum";

@Entity({ name: 'notifications', schema: 'notify' })
export class Notification extends BasicEntity {


    // @ManyToOne(() => User, { eager: false })
    // @Column()
    // userOrigin: string;

    @Column({
        enum:notifyEnum,
        default: notifyEnum.USERS
    })
    destinyType: notifyEnum

    @Column({
        type: "varchar",nullable:true
    })
    destinyID: string  

    @Column({
        type: "boolean",nullable:true,default:true
    })
    isOrder: boolean  


    @Column({
        type: "varchar"
    })
    message: string
  
    @Column({
        type: "boolean",nullable:true,default:false
    })
    isRead: boolean  
}
