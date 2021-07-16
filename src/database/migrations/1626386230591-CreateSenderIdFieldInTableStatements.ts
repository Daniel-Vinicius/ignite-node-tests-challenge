import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class CreateSenderIdFieldInTableStatements1626386230591 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn("statements", new TableColumn({
      name: "sender_id",
      type: "uuid",
      isNullable: true
    }));

    await queryRunner.createForeignKey("statements", new TableForeignKey({
      name: "FKSenderId",
      columnNames: ["sender_id"],
      referencedColumnNames: ["id"],
      referencedTableName: "users"
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey("statements", "FKSenderId")
    await queryRunner.dropColumn("statements", "sender_id")
  }
}
