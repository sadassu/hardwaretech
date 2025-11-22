import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/User.js";

dotenv.config();

// Script to update a user's role to admin
// Usage: node scripts/updateUserRole.js <email> <role>
// Example: node scripts/updateUserRole.js admin@example.com admin

async function updateUserRole() {
  const email = process.argv[2];
  const role = process.argv[3];

  if (!email || !role) {
    console.log("Usage: node scripts/updateUserRole.js <email> <role>");
    console.log("Example: node scripts/updateUserRole.js admin@example.com admin");
    console.log("Valid roles: user, admin, cashier");
    process.exit(1);
  }

  const validRoles = ["user", "admin", "cashier"];
  if (!validRoles.includes(role)) {
    console.log(`Invalid role: ${role}`);
    console.log("Valid roles: user, admin, cashier");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const user = await User.findOne({ email });

    if (!user) {
      console.log(`User with email ${email} not found`);
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log("\nCurrent user info:");
    console.log(`Name: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Current Roles: ${JSON.stringify(user.roles)}`);

    // Update roles - add the role if not already present
    if (!user.roles.includes(role)) {
      user.roles.push(role);
      await user.save();
      console.log(`\n✅ Successfully added '${role}' role to user`);
    } else {
      console.log(`\n⚠️ User already has '${role}' role`);
    }

    console.log(`Updated Roles: ${JSON.stringify(user.roles)}`);

    await mongoose.connection.close();
    console.log("\nDisconnected from MongoDB");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

updateUserRole();

