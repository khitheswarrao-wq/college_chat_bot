import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class Document extends Model {
  public id!: number;
  public name!: string;
  public fileName!: string;
  public fileType!: string;
  public fileSize!: number;
  public storagePath!: string;
  public status!: "UPLOADED" | "PROCESSING" | "PROCESSED" | "FAILED";
  public pageCount!: number;
  public uploadedBy!: number;
  public processingError!: string | null;
  public chunkCount!: number;
}

Document.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    fileName: { type: DataTypes.STRING, allowNull: false },
    fileType: { type: DataTypes.STRING, allowNull: false },
    fileSize: { type: DataTypes.INTEGER, allowNull: false },
    storagePath: { type: DataTypes.STRING, allowNull: false },
    status: {
      type: DataTypes.ENUM("UPLOADED", "PROCESSING", "PROCESSED", "FAILED"),
      defaultValue: "UPLOADED",
    },
    pageCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    uploadedBy: { type: DataTypes.INTEGER, allowNull: false },
    processingError: { type: DataTypes.TEXT, allowNull: true },
    chunkCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  { sequelize, tableName: "documents", timestamps: true }
);
