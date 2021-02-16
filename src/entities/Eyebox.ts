import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { EyeAccount } from "./EyeAccount";

@Index("FKEyeboxToSenderId", ["senderId"], {})
@Index("FKEyeboxToRecieverId", ["recieverId"], {})
@Entity("Eyebox", { schema: "mbo" })
export class Eyebox {
  @Column("int", { primary: true, name: "ID" })
  public id: number;

  @Column("int", { name: "SenderID" })
  public senderId: number;

  @Column("int", { name: "RecieverID" })
  public recieverId: number;

  @Column("varchar", { name: "SubjectLine", nullable: true, length: 64 })
  public subjectLine: string | null;

  @Column("datetime", { name: "tStamp"})
  public tStamp: Date;

  @Column("varchar", { name: "MessageBody", nullable: true, length: 255 })
  public messageBody: string | null;

  @ManyToOne(() => EyeAccount, (eyeAccount) => eyeAccount.eyeboxes, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "RecieverID", referencedColumnName: "id" }])
  public reciever: EyeAccount;

  @ManyToOne(() => EyeAccount, (eyeAccount) => eyeAccount.eyeboxes2, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "SenderID", referencedColumnName: "id" }])
  public sender: EyeAccount;
}
