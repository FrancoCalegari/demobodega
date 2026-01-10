const bcrypt = require("bcrypt");
const { runInsert, allQuery } = require("./supabase");

async function initializeDatabase() {
	try {
		console.log("🔧 Checking database initialization...");

		// Check if any users exist
		const users = await allQuery("users");

		if (users.length === 0) {
			console.log("👤 No users found. Creating default admin user...");

			// Create default admin user
			const hashedPassword = await bcrypt.hash("admin", 10);

			await runInsert("users", {
				username: "admin",
				password: hashedPassword,
				role: "admin",
			});

			console.log(
				"✅ Default admin user created (username: admin, password: admin)"
			);
			console.log(
				"⚠️  IMPORTANT: Change the default password after first login!"
			);
		} else {
			console.log(`✅ Database initialized with ${users.length} user(s)`);
		}
	} catch (error) {
		console.error("❌ Error initializing database:", error);
		console.log("⚠️  Make sure you have executed the Supabase schema first!");
	}
}

module.exports = { initializeDatabase };
