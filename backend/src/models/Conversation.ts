import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class Conversation extends Model {
  public id!: number;
  public userId!: number;
  public title!: string;
}

Conversation.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING, defaultValue: "New Conversation" },
  },
  { sequelize, tableName: "conversations", timestamps: true }
);
