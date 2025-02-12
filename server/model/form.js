import { DataTypes } from "sequelize";
import sequelize  from "../config/db.js";
import User from "../model/user.js";

const FormData = sequelize.define("UserData", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    hobbies: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    education: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pets: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    workout: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    drinking: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });
  
  // Establish One-to-One Relationship
  User.hasOne(FormData, { foreignKey: "userId", onDelete: "CASCADE" });
  FormData.belongsTo(User, { foreignKey: "userId" });

  export default FormData;
