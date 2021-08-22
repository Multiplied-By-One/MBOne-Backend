import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  BaseEntity
} from "typeorm";
import { Headmate } from "./Headmate";
import { Meeting } from "./Meeting";

@Index("FKMeetingToMeetingId", ["meetingId"], {})
@Index("FKMeetingEntHeadmateId", ["headmateId"], {})
@Entity("MeetingEntry", { schema: "mbo" })
export class MeetingEntry extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "int", name: "ID" })
  public id: number;

  @Column("int", { name: "MeetingID" })
  public meetingId: number;

  @Column("int", { name: "HeadmateID" })
  public headmateId: number;

  @Column("datetime", { name: "tStamp"})
  public tStamp: Date;

  @Column("varchar", { name: "Mbody", nullable: true, length: 255 })
  public mbody: string | null;

  @ManyToOne(() => Headmate, (headmate) => headmate.meetingEntries, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "HeadmateID", referencedColumnName: "id" }])
  public headmate: Headmate;

  @ManyToOne(() => Meeting, (meeting) => meeting.meetingEntries, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "MeetingID", referencedColumnName: "id" }])
  public meeting: Meeting;
}
