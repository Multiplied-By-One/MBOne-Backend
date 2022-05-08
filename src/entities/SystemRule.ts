import { Column, Entity, Index, JoinColumn, ManyToOne, BaseEntity, Relation } from "typeorm";
import { User } from "./User";

@Index("FKSystemRule913825", ["userId"], {})
@Entity("SystemRule", { schema: "mbo" })
export class SystemRule extends BaseEntity {
  @Column("int", { primary: true, name: "ID" })
  public id: number;

  @Column("int", { name: "userID" })
  public userId: number;

  @Column("varchar", { name: "SystemName", nullable: true, length: 128 })
  public systemName: string | null;

  @Column("int", { name: "hFont", default: () => "'0'" })
  public hFont: number;

  @Column("int", { name: "hFontsize", default: () => "'0'" })
  public hFontsize: number;

  @Column("int", { name: "mFont", default: () => "'0'" })
  public mFont: number;

  @Column("int", { name: "mFontsize", default: () => "'0'" })
  public mFontsize: number;

  @ManyToOne(() => User, (user) => user.systemRules, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "userID", referencedColumnName: "id" }])
  public user: Relation<User>;
}
