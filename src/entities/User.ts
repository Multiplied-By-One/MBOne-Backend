import { Entity, OneToMany, PrimaryGeneratedColumn, Column, BaseEntity} from "typeorm";
import { EyeAccount } from "./EyeAccount";
import { Headmate } from "./Headmate";
import { MeetingSpace } from "./MeetingSpace";
import { Reminders } from "./Reminders";
import { SystemRule } from "./SystemRule";

@Entity("User", { schema: "mbo" })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "int", name: "ID" })
  public id: number;
  
  @Column("int")
  public googleAccountId: number;

  @Column("varchar", { name: "GmailAddress", nullable: false, length: 255 })
  public emailAddress: string;

  @OneToMany(() => EyeAccount, (eyeAccount) => eyeAccount.user)
  public eyeAccounts: EyeAccount[];

  @OneToMany(() => Headmate, (headmate) => headmate.user)
  public headmates: Headmate[];

  @OneToMany(() => MeetingSpace, (meetingSpace) => meetingSpace.user)
  public meetingSpaces: MeetingSpace[];

  @OneToMany(() => Reminders, (reminders) => reminders.assignee)
  public reminders: Reminders[];

  @OneToMany(() => SystemRule, (systemRule) => systemRule.user)
  public systemRules: SystemRule[];
}
