import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class DocumentChunk extends Model {
  public id!: number;
  public documentId!: number;
  public chunkIndex!: number;
  public text!: string;
  public pageNumber!: number;
  public metadata!: object;
}

DocumentChunk.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    documentId: { type: DataTypes.INTEGER, allowNull: false },
    chunkIndex: { type: DataTypes.INTEGER, allowNull: false },
    text: { type: DataTypes.TEXT, allowNull: false },
    pageNumber: { type: DataTypes.INTEGER, defaultValue: 1 },
    metadata: { type: DataTypes.JSONB, defaultValue: {} },
    // embedding stored in PostgreSQL via raw pg/pgvector, not via Sequelize
  },
  { sequelize, tableName: "document_chunks", timestamps: true }
);
