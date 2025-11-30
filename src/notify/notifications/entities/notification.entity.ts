import { BasicEntity } from "../../../common/base/entities";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { notifyEnum } from "src/common/enum/notify.enum";
import { DestinationType } from "src/common/base/types/destination.type";

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

    @Column(
        'json'
    )
    destinyUser: DestinationType[]
    
    @Column({
        type: "varchar"
    })
    message: string

}
