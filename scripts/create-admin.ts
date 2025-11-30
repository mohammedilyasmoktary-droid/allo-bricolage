/**
 * Script to create an admin user
 * Run with: npx tsx scripts/create-admin.ts
 * Or: node --loader ts-node/esm scripts/create-admin.ts
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local file
config({ path: resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI || "";
const AdminUserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true }
}, { timestamps: true });

const AdminUser = mongoose.models.AdminUser || mongoose.model("AdminUser", AdminUserSchema);

async function createAdmin() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI environment variable is required");
    process.exit(1);
  }

  const username = process.argv[2] || "admin";
  const password = process.argv[3] || "admin123";

  try {
    await mongoose.connect(MONGODB_URI);
    const existing = await AdminUser.findOne({ username });
    if (existing) {
      console.log(`Admin user "${username}" already exists. Updating password...`);
      existing.passwordHash = await bcrypt.hash(password, 10);
      await existing.save();
      console.log(`Password updated for "${username}"`);
    } else {
      const passwordHash = await bcrypt.hash(password, 10);
      await AdminUser.create({ username, passwordHash });
      console.log(`Admin user "${username}" created successfully`);
    }
    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

createAdmin();

