import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

export const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    })
  : new Sequelize(
      process.env.DB_NAME || "collegeai",
      process.env.DB_USER || "postgres",
      process.env.DB_PASSWORD || "postgres",
      {
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5432"),
        dialect: "postgres",
        logging: false,
        dialectOptions:
          process.env.DB_SSL === "true" ||
          process.env.DB_HOST?.includes("supabase.co") ||
          process.env.DB_HOST?.includes("render.com") ||
          process.env.DB_HOST?.includes("oregon-postgres.render.com") ||
          process.env.DB_HOST?.includes("frankfurt-postgres.render.com") ||
          process.env.DB_HOST?.includes("singapore-postgres.render.com")
            ? { ssl: { require: true, rejectUnauthorized: false } }
            : {},
      }
    );

