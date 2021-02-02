import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Headmate } from "./Headmate";
import { Meeting } from "./Meeting";

@Index("FKMeetingEnt22570", ["meetingId"], {})
@Index("FKMeetingEnt106269", ["headmateId"], {})
@Entity("MeetingEntry", { schema: "mbo" })
export class MeetingEntry {
  @PrimaryGeneratedColumn({ type: "int", name: "ID" })
  public id: number;

  @Column("int", { name: "MeetingID" })
  public meetingId: number;

  @Column("int", { name: "HeadmateID" })
  public headmateId: number;

  @Column("timestamp", { name: "tStamp", default: () => "CURRENT_TIMESTAMP" })
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
