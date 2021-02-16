import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Meeting } from "./Meeting";
import { User } from "./User";

@Index("FKMeetingSpaUserId", ["userId"], {})
@Entity("MeetingSpace", { schema: "mbo" })
export class MeetingSpace {
  @PrimaryGeneratedColumn({ type: "int", name: "ID" })
  public id: number;

  @Column("int", { name: "UserID" })
  public userId: number;

  @OneToMany(() => Meeting, (meeting) => meeting.meetingSpace)
  public meetings: Meeting[];

  @ManyToOne(() => User, (user) => user.meetingSpaces, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "UserID", referencedColumnName: "id" }])
  public user: User;
}
