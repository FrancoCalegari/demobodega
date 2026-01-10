const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const DB_PATH = path.join(__dirname, "valzoe.db");

// Create database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
	if (err) {
		console.error("Error opening database:", err);
	} else {
		console.log("✅ Connected to SQLite database");
	}
});

// Enable foreign keys
db.run("PRAGMA foreign_keys = ON");

// Helper function to run queries as promises
const runQuery = (sql, params = []) => {
	return new Promise((resolve, reject) => {
		db.run(sql, params, function (err) {
			if (err) reject(err);
			else resolve({ id: this.lastID, changes: this.changes });
		});
	});
};

const getQuery = (sql, params = []) => {
	return new Promise((resolve, reject) => {
		db.get(sql, params, (err, row) => {
			if (err) reject(err);
			else resolve(row);
		});
	});
};

const allQuery = (sql, params = []) => {
	return new Promise((resolve, reject) => {
		db.all(sql, params, (err, rows) => {
			if (err) reject(err);
			else resolve(rows);
		});
	});
};

module.exports = {
	db,
	runQuery,
	getQuery,
	allQuery,
};
