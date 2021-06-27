import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  BaseEntity
} from "typeorm";
import { Journal } from "./Journal";

@Index("FKJournalEntToJournalId", ["journalId"], {})
@Entity("JournalEntry", { schema: "mbo" })
export class JournalEntry extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "int", name: "ID" })
  public id: number;

  @Column("int", { name: "JournalID" })
  public journalId: number;

  @Column("datetime", { name: "tStamp" })
  public tStamp: Date;

  @Column("varchar", {
    name: "Etitle",
    length: 64,
    default: () => "'Heading / Title'",
  })
  public etitle: string;

  @Column("varchar", { name: "Ebody", nullable: true, length: 255 })
  public ebody: string | null;

  @ManyToOne(() => Journal, (journal) => journal.journalEntries, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "JournalID", referencedColumnName: "id" }])
  public journal: Journal;
}
