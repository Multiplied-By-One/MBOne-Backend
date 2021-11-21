import {
  Column,
  Entity,
  Index,
  Unique,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  BaseEntity
} from "typeorm";
import { IsOptional, IsNotEmpty, IsIn, IsInt, Min, Max, IsString, Length, IsAlphanumeric, IsJSON } from 'class-validator'
import { EyeAccount } from "./EyeAccount";
import { User } from "./User";
import { MeetingEntry } from "./MeetingEntry";
import { Reminders } from "./Reminders";
import { Gender } from '../libs/constants';

@Index("FKHeadmateToUserId", ["userId"], {})
@Entity("Headmate", { schema: "mbo" })
@Unique(["userId", "hName"])
export class Headmate extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "int", name: "ID" })
  public id: number;

  @Column("int", { name: "UserID" })
  @IsNotEmpty()
  @IsInt()
  public userId: number;

  @Column("varchar", { name: "hName", nullable: false })
  @IsNotEmpty()
  @IsAlphanumeric()
  @Length(1, 80)
  public hName: string;

  @Column("varchar", { name: "hGender", nullable: true })
  @IsOptional()
  @IsIn([ Gender.Male, Gender.Female, Gender.Unspecified ])
  @Length(1, 1)
  public hGender: string | Gender.Unspecified;

  @Column("int", { name: "hAge", nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(180)
  public hAge: number | null;

  @Column("varchar", { name: "profileImgFilename", nullable: true })
  @IsOptional()
  @IsString()
  public profileImgFilename: string | null;

  @Column("simple-json", { nullable: true })
  @IsOptional()
  @IsJSON()
  @Length(1,10000)
  public traits: string | null;

  @Column("text", { nullable: true })
  @IsOptional()
  @IsString()
  @Length(1,10000)
  public info: string | null;

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
