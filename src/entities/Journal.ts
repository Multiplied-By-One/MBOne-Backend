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
import { EyeAccount } from "./EyeAccount";
import { JournalEntry } from "./JournalEntry";

@Index("FKJournalToEyeAccountId", ["eyeAccountId"], {})
@Entity("Journal", { schema: "mbo" })
export class Journal extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "int", name: "ID" })
  public id: number;

  @Column("int", { name: "EyeAccountID" })
  public eyeAccountId: number;

  @ManyToOne(() => EyeAccount, (eyeAccount) => eyeAccount.journals, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "EyeAccountID", referencedColumnName: "id" }])
  public eyeAccount: EyeAccount;

  @OneToMany(() => JournalEntry, (journalEntry) => journalEntry.journal)
  public journalEntries: JournalEntry[];
}
