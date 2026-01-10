const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const { db } = require("./db");

// Read and execute schema
const schemaPath = path.join(__dirname, "schema.sql");
const schema = fs.readFileSync(schemaPath, "utf8");

// Split by semicolons and execute each statement
const statements = schema.split(";").filter((stmt) => stmt.trim());

console.log("🔧 Initializing database...");

statements.forEach((statement, index) => {
	db.run(statement, (err) => {
		if (err) {
			console.error(`❌ Error executing statement ${index + 1}:`, err.message);
		}
	});
});

// Create default admin user
const defaultUsername = "admin";
const defaultPassword = "admin123"; // CHANGE THIS IN PRODUCTION!

bcrypt.hash(defaultPassword, 10, (err, hash) => {
	if (err) {
		console.error("❌ Error hashing password:", err);
		return;
	}

	db.run(
		"INSERT OR IGNORE INTO users (username, passwordHash, role) VALUES (?, ?, ?)",
		[defaultUsername, hash, "admin"],
		function (err) {
			if (err) {
				console.error("❌ Error creating admin user:", err);
			} else if (this.changes > 0) {
				console.log("✅ Default admin user created");
				console.log(`   Username: ${defaultUsername}`);
				console.log(`   Password: ${defaultPassword}`);
				console.log("   ⚠️  CHANGE THIS PASSWORD IN PRODUCTION!");
			}
		}
	);
});

setTimeout(() => {
	console.log("✅ Database initialized successfully");
	process.exit(0);
}, 1000);
