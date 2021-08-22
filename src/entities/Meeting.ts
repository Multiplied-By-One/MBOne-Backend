import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  BaseEntity
} from "typeorm";
import { MeetingSpace } from "./MeetingSpace";
import { MeetingEntry } from "./MeetingEntry";

@Index("FKMeetingToMeetingSpaceId", ["meetingSpaceId"], {})
@Entity("Meeting", { schema: "mbo" })
export class Meeting extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "int", name: "ID" })
  public id: number;

  @Column("int", { name: "MeetingSpaceID" })
  public meetingSpaceId: number;

  @Column("varchar", {
    name: "Mtitle",
    length: 64,
    default: () => "'Heading / Title'",
  })
  public mtitle: string;

  @Column("datetime", { name: "tStamp"})
  public datetime: Date;

  @ManyToOne(() => MeetingSpace, (meetingSpace) => meetingSpace.meetings, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "MeetingSpaceID", referencedColumnName: "id" }])
  public meetingSpace: MeetingSpace;

  @OneToMany(() => MeetingEntry, (meetingEntry) => meetingEntry.meeting)
  public meetingEntries: MeetingEntry[];
}
