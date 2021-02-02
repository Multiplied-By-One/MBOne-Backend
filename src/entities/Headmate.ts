import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { EyeAccount } from "./EyeAccount";
import { User } from "./User";
import { MeetingEntry } from "./MeetingEntry";
import { Reminders } from "./Reminders";

@Index("FKHeadmate61032", ["userId"], {})
@Entity("Headmate", { schema: "mbo" })
export class Headmate {
  @PrimaryGeneratedColumn({ type: "int", name: "ID" })
  public id: number;

  @Column("int", { name: "UserID" })
  public userId: number;

  @Column("int", { name: "hName" })
  public hName: number;

  @Column("int", { name: "hGender", nullable: true })
  public hGender: number | null;

  @Column("int", { name: "hAge", nullable: true })
  public hAge: number | null;

  @OneToMany(() => EyeAccount, (eyeAccount) => eyeAccount.headmate)
  public eyeAccounts: EyeAccount[];

  @ManyToOne(() => User, (user) => user.headmates, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "UserID", referencedColumnName: "id" }])
  public user: User;

  @OneToMany(() => MeetingEntry, (meetingEntry) => meetingEntry.headmate)
  public meetingEntries: MeetingEntry[];

  @OneToMany(() => Reminders, (reminders) => reminders.headmate)
  public reminders: Reminders[];
}
