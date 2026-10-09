import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";

export const seedSuperAdmin = async () => {
  try {
    const adminEmail = "admin@gmail.com";
    const plainPassword = "123123";

    let superAdmin = await Admin.findOne({ email: adminEmail });

    if (!superAdmin) {
      const hashedPassword = await bcrypt.hash(plainPassword, 12);
      superAdmin = await Admin.create({
        name: "Main Super Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "superadmin",
        isSuperAdmin: true,
      });
      console.log(`[SuperAdmin] Successfully seeded Super Admin: ${adminEmail}`);
    } else {
      // Ensure password is synchronized with 123123 if changed
      const isMatch = await bcrypt.compare(plainPassword, superAdmin.password);
      if (!isMatch) {
        superAdmin.password = await bcrypt.hash(plainPassword, 12);
        superAdmin.isSuperAdmin = true;
        superAdmin.role = "superadmin";
        await superAdmin.save();
        console.log(`[SuperAdmin] Reset Super Admin password to default for: ${adminEmail}`);
      }
    }
  } catch (error) {
    console.error("[SuperAdmin] Failed to seed super admin:", error.message);
  }
};
