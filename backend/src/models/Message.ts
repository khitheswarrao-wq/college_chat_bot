import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class Message extends Model {
  public id!: number;
  public conversationId!: number;
  public role!: "user" | "assistant";
  public content!: string;
  public sources!: object[] | null;
}

Message.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    conversationId: { type: DataTypes.INTEGER, allowNull: false },
    role: { type: DataTypes.ENUM("user", "assistant"), allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    sources: { type: DataTypes.JSONB, allowNull: true },
  },
  { sequelize, tableName: "messages", timestamps: true }
);
