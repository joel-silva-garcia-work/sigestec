import { BasicEntity } from "../../../common/base/entities";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { notifyEnum } from "./../../../common/enum/notify.enum";
import { DestinationType } from "./../../../common/base/types/destination.type";

@Entity({ name: 'notifications', schema: 'notify' })
export class Notification extends BasicEntity {


    // @ManyToOne(() => User, { eager: false })
    @Column()
    userOrigin: string;

    @Column({
        enum:notifyEnum,
        default: notifyEnum.USERS
    })
    destinyType: notifyEnum

    @Column({
        type: "varchar",nullable:true
    })
    OriginID: string  

    @Column({
        type: "varchar",nullable:true
    })
    DestinyID: string  

    @Column({
        type: "boolean",nullable:true,default:true
    })
    Order: boolean  

    @Column({
        type: "varchar",nullable:true
    })
    ObjectID: string  
    
    //Quitar
    @Column(
        'json'
    )
    destinyUser: DestinationType[]
    
    @Column({
        type: "varchar"
    })
    message: string

}
