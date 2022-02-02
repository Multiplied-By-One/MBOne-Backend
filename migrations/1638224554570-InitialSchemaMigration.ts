import {MigrationInterface, QueryRunner} from "typeorm";

export class InitialSchemaMigration1638224554570 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query("")
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
