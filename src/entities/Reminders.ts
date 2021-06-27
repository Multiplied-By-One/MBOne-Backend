import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  BaseEntity
} from "typeorm";
import { User } from "./User";
import { Headmate } from "./Headmate";

@Index("FKRemindersToAssigneeId", ["assigneeId"], {})
@Index("FKRemindersToHeadmateId", ["headmateId"], {})
@Entity("Reminders", { schema: "mbo" })
export class Reminders extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "int", name: "ID" })
  public id: number;

  @Column("int", { name: "AssigneeID", nullable: true })
  public assigneeId: number | null;

  @Column("int", { name: "HeadmateID" })
  public headmateId: number;

  @Column("datetime", { name: "Time"})
  public time: Date;

  @Column("varchar", { name: "Message", nullable: true, length: 255 })
  public message: string | null;

  @Column("tinyint", { name: "Completion", width: 1 })
  public completion: boolean;

  @ManyToOne(() => User, (user) => user.reminders, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "AssigneeID", referencedColumnName: "id" }])
  public assignee: User;

  @ManyToOne(() => Headmate, (headmate) => headmate.reminders, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "HeadmateID", referencedColumnName: "id" }])
  public headmate: Headmate;
}
