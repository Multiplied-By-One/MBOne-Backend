import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";
import { Headmate } from "./Headmate";

@Index("FKReminders326427", ["assigneeId"], {})
@Index("FKReminders69628", ["headmateId"], {})
@Entity("Reminders", { schema: "mbo" })
export class Reminders {
  @PrimaryGeneratedColumn({ type: "int", name: "ID" })
  public id: number;

  @Column("int", { name: "AssigneeID", nullable: true })
  public assigneeId: number | null;

  @Column("int", { name: "HeadmateID" })
  public headmateId: number;

  @Column("timestamp", { name: "Time", default: () => "CURRENT_TIMESTAMP" })
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
