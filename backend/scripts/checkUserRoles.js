import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/User.js";

dotenv.config();

// Script to check and display user roles
async function checkUserRoles() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Get all users
    const users = await User.find({}).select("name email roles googleId");

    console.log("\n=== All Users and Their Roles ===\n");
    users.forEach((user) => {
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Roles: ${JSON.stringify(user.roles)}`);
      console.log(`Has Google ID: ${user.googleId ? "Yes" : "No"}`);
      console.log("---");
    });

    console.log(`\nTotal users: ${users.length}`);

    await mongoose.connection.close();
    console.log("\nDisconnected from MongoDB");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkUserRoles();

