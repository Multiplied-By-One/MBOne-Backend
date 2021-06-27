import {Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, BaseEntity} from "typeorm";
import { User } from "./User";
import { Headmate } from "./Headmate";
import { Eyebox } from "./Eyebox";
import { Journal } from "./Journal";

@Index("FKEyeAccountToUserId", ["userId"], {})
@Index("FKEyeAccountToHeadmateId", ["headmateId"], {})
@Entity("EyeAccount", { schema: "mbo" })
export class EyeAccount extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "int", name: "ID" })
  public id: number;

  @Column("int", { name: "UserID" })
  public userId: number;

  @Column("int", { name: "HeadmateID", nullable: true })
  public headmateId: number | null;

  @Column("varchar", { name: "EyeName", nullable: true, length: 128 })
  public eyeName: string | null;

  @Column("int", { name: "hFont", default: () => "'0'" })
  public hFont: number;

  @Column("int", { name: "hFontsize", default: () => "'0'" })
  public hFontsize: number;

  @Column("int", { name: "mFont", default: () => "'0'" })
  public mFont: number;

  @Column("int", { name: "mFontsize", default: () => "'0'" })
  public mFontsize: number;

  @Column("varchar", { name: "pWord", nullable: true, length: 16 })
  public pWord: string | null;

  @ManyToOne(() => User, (user) => user.eyeAccounts, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "UserID", referencedColumnName: "id" }])
  public user: User;

  @ManyToOne(() => Headmate, (headmate) => headmate.eyeAccounts, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "HeadmateID", referencedColumnName: "id" }])
  public headmate: Headmate;

  @OneToMany(() => Eyebox, (eyebox) => eyebox.receiver)
  public eyeboxes: Eyebox[];

  @OneToMany(() => Eyebox, (eyebox) => eyebox.sender)
  public eyeboxes2: Eyebox[];

  @OneToMany(() => Journal, (journal) => journal.eyeAccount)
  public journals: Journal[];
}
