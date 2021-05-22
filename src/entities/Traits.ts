/*
- headmate id
- list of traits access / stored permenantly / read only 
- prompts / stored permenantly / read only
- headmates traits - one headmate, many traits
- headmates prompts - one headmate, many prompts
- prompt response - one to one, one prompt one response
*/
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
  
  @Index("FKTraitsToHeadmateId", ["headmateId"], {})
  @Entity("Traits", { schema: "mbo" })
  export class Traits extends BaseEntity {
    @PrimaryGeneratedColumn({ type: "int", name: "ID" })
    public id: number;
  
    @Column("int", { name: "HeadmateID", nullable: true })
    public headmateId: number | null;
  
    @Column("varchar", { name: "Traits", length: 128 })
    public trait: string;

    @ManyToOne(() => Headmate, (headmate) => headmate.traits, {
        onDelete: "RESTRICT",
        onUpdate: "RESTRICT",
      })
    @JoinColumn([{ name: "HeadmateID", referencedColumnName: "id" }])
    public headmate: Headmate;
  }