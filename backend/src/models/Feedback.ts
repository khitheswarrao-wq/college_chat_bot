import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class Feedback extends Model {
  public id!: number;
  public userId!: number;
  public messageId!: number;
  public rating!: "helpful" | "not_helpful";
  public comment!: string | null;
}

Feedback.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    messageId: { type: DataTypes.INTEGER, allowNull: false },
    rating: { type: DataTypes.ENUM("helpful", "not_helpful"), allowNull: false },
    comment: { type: DataTypes.TEXT, allowNull: true },
  },
  { sequelize, tableName: "feedback", timestamps: true }
);
