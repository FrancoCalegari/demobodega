const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
	throw new Error("Missing Supabase URL or Key in environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Run a query that returns multiple rows
 * @param {string} table - Table name
 * @param {object} options - Query options (select, filters, order, etc.)
 * @returns {Promise<Array>}
 */
async function allQuery(table, options = {}) {
	try {
		let query = supabase.from(table).select(options.select || "*");

		// Apply filters
		if (options.filters) {
			Object.entries(options.filters).forEach(([key, value]) => {
				query = query.eq(key, value);
			});
		}

		// Apply ordering
		if (options.order) {
			query = query.order(options.order.column, {
				ascending: options.order.ascending !== false,
			});
		}

		const { data, error } = await query;

		if (error) throw error;
		return data || [];
	} catch (error) {
		console.error("Supabase allQuery error:", error);
		throw error;
	}
}

/**
 * Run a query that returns a single row
 * @param {string} table - Table name
 * @param {object} filters - Filters to apply
 * @returns {Promise<Object|null>}
 */
async function getQuery(table, filters) {
	try {
		let query = supabase.from(table).select("*");

		Object.entries(filters).forEach(([key, value]) => {
			query = query.eq(key, value);
		});

		const { data, error } = await query.single();

		if (error) {
			if (error.code === "PGRST116") return null; // No rows found
			throw error;
		}

		return data;
	} catch (error) {
		console.error("Supabase getQuery error:", error);
		throw error;
	}
}

/**
 * Insert a new row
 * @param {string} table - Table name
 * @param {object} data - Data to insert
 * @returns {Promise<Object>} - Inserted row with id
 */
async function runInsert(table, data) {
	try {
		const { data: result, error } = await supabase
			.from(table)
			.insert(data)
			.select()
			.single();

		if (error) throw error;
		return result;
	} catch (error) {
		console.error("Supabase runInsert error:", error);
		throw error;
	}
}

/**
 * Update rows
 * @param {string} table - Table name
 * @param {object} data - Data to update
 * @param {object} filters - Filters to identify rows
 * @returns {Promise<Array>}
 */
async function runUpdate(table, data, filters) {
	try {
		let query = supabase.from(table).update(data);

		Object.entries(filters).forEach(([key, value]) => {
			query = query.eq(key, value);
		});

		const { data: result, error } = await query.select();

		if (error) throw error;
		return result || [];
	} catch (error) {
		console.error("Supabase runUpdate error:", error);
		throw error;
	}
}

/**
 * Delete rows
 * @param {string} table - Table name
 * @param {object} filters - Filters to identify rows
 * @returns {Promise<void>}
 */
async function runDelete(table, filters) {
	try {
		let query = supabase.from(table);

		Object.entries(filters).forEach(([key, value]) => {
			query = query.delete().eq(key, value);
		});

		const { error } = await query;

		if (error) throw error;
	} catch (error) {
		console.error("Supabase runDelete error:", error);
		throw error;
	}
}

/**
 * Execute raw SQL (for complex queries)
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>}
 */
async function rawQuery(sql, params = []) {
	try {
		const { data, error } = await supabase.rpc("execute_sql", {
			query: sql,
			params,
		});

		if (error) throw error;
		return data || [];
	} catch (error) {
		console.error("Supabase rawQuery error:", error);
		throw error;
	}
}

console.log("✅ Connected to Supabase database");

module.exports = {
	supabase,
	allQuery,
	getQuery,
	runInsert,
	runUpdate,
	runDelete,
	rawQuery,
};
