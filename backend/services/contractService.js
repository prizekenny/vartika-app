import pool from "../config/database.js";

/**
 * Get all contracts with pagination and search
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (starts from 1)
 * @param {number} options.limit - Number of items per page
 * @param {string} options.search - Search term for filtering
 * @returns {Promise<Object>} Paginated contracts and total count
 */
export const getAllContracts = async (options = {}) => {
  const { page = 1, limit = 10, search = "" } = options;
  const offset = (page - 1) * limit;

  console.log("Pagination parameters:", { page, limit, offset, search });

  try {
    let query = `
      SELECT 
        c.*,
        u.username,
        u.email
      FROM contracts c 
      LEFT JOIN users u ON c.user_id = u.user_id
    `;
    let countQuery = `
      SELECT COUNT(DISTINCT c.contract_id) 
      FROM contracts c 
      LEFT JOIN users u ON c.user_id = u.user_id
    `;
    const queryParams = [];
    let paramIndex = 1;

    // Add search condition if search term is provided
    if (search) {
      const searchCondition = `
        WHERE (c.subject ILIKE $${paramIndex} 
        OR c.content ILIKE $${paramIndex} 
        OR c.status ILIKE $${paramIndex}
        OR u.username ILIKE $${paramIndex})
      `;
      query += searchCondition;
      countQuery += searchCondition;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Add ordering
    query += " ORDER BY c.created_at DESC";

    // Add pagination
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    console.log("SQL query:", query);
    console.log("Query parameters:", queryParams);

    // Get total count
    const totalResult = await pool.query(
      countQuery,
      search ? [queryParams[0]] : []
    );
    const total = parseInt(totalResult.rows[0].count);

    console.log("Total records:", total);

    // Get paginated results
    const result = await pool.query(query, queryParams);

    console.log("Query result count:", result.rows.length);
    console.log("Current page data:", result.rows);

    return {
      contracts: result.rows,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      limit: parseInt(limit),
    };
  } catch (error) {
    console.error("Failed to get contracts:", error);
    throw error;
  }
};

/**
 * Get a single contract by ID
 * @param {string} contractId - Contract ID
 * @returns {Promise<Object>} Contract details
 */
export const getContractById = async (contractId) => {
  try {
    const result = await pool.query(
      `SELECT c.*, u.username, u.email 
       FROM contracts c
       LEFT JOIN users u ON c.user_id = u.user_id
       WHERE c.contract_id = $1`,
      [contractId]
    );

    if (result.rows.length === 0) {
      throw new Error("Contract not found");
    }

    return result.rows[0];
  } catch (error) {
    console.error("Failed to get contract details:", error);
    throw error;
  }
};

/**
 * Get contracts by user ID
 * @param {string} userId - User ID
 * @returns {Promise<Array>} User's contract list
 */
export const getContractsByUserId = async (userId) => {
  try {
    const result = await pool.query(
      `SELECT c.*, u.username, u.email
       FROM contracts c
       LEFT JOIN users u ON c.user_id = u.user_id
       WHERE c.user_id = $1 
       ORDER BY c.created_at DESC`,
      [userId]
    );
    return result.rows;
  } catch (error) {
    console.error("Failed to get user contracts:", error);
    throw error;
  }
};

/**
 * Create a new contract
 * @param {Object} contractData - Contract data
 * @returns {Promise<Object>} Created contract details
 */
export const createContract = async (contractData) => {
  const {
    user_id,
    subject,
    content,
    amount,
    start_date,
    expiration_date,
    status = "Pending",
  } = contractData;

  try {
    const result = await pool.query(
      `WITH inserted_contract AS (
         INSERT INTO contracts 
           (user_id, subject, content, amount, start_date, expiration_date, status) 
         VALUES 
           ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING *
       )
       SELECT c.*, u.username, u.email
       FROM inserted_contract c
       LEFT JOIN users u ON c.user_id = u.user_id`,
      [user_id, subject, content, amount, start_date, expiration_date, status]
    );

    return result.rows[0];
  } catch (error) {
    console.error("Failed to create contract:", error);
    throw error;
  }
};

/**
 * Update a contract
 * @param {string} contractId - Contract ID
 * @param {Object} contractData - Updated contract data
 * @returns {Promise<Object>} Updated contract details
 */
export const updateContract = async (contractId, contractData) => {
  const { subject, content, amount, start_date, expiration_date, status } =
    contractData;

  try {
    // First check if contract exists
    const checkResult = await pool.query(
      "SELECT * FROM contracts WHERE contract_id = $1",
      [contractId]
    );

    if (checkResult.rows.length === 0) {
      throw new Error("Contract not found");
    }

    // Build dynamic update query
    let updateFields = [];
    let queryParams = [];
    let paramIndex = 1;

    if (subject !== undefined) {
      updateFields.push(`subject = $${paramIndex++}`);
      queryParams.push(subject);
    }

    if (content !== undefined) {
      updateFields.push(`content = $${paramIndex++}`);
      queryParams.push(content);
    }

    if (amount !== undefined) {
      updateFields.push(`amount = $${paramIndex++}`);
      queryParams.push(amount);
    }

    if (start_date !== undefined) {
      updateFields.push(`start_date = $${paramIndex++}`);
      queryParams.push(start_date);
    }

    if (expiration_date !== undefined) {
      updateFields.push(`expiration_date = $${paramIndex++}`);
      queryParams.push(expiration_date);
    }

    if (status !== undefined) {
      updateFields.push(`status = $${paramIndex++}`);
      queryParams.push(status);
    }

    // Add update timestamp
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    // If no update fields, return original record
    if (updateFields.length === 1) {
      // Only updated_at
      return checkResult.rows[0];
    }

    // Add contract ID to parameters
    queryParams.push(contractId);

    const updateQuery = `
      UPDATE contracts 
      SET ${updateFields.join(", ")} 
      WHERE contract_id = $${paramIndex} 
      RETURNING *
    `;

    const result = await pool.query(updateQuery, queryParams);
    return result.rows[0];
  } catch (error) {
    console.error("Failed to update contract:", error);
    throw error;
  }
};

/**
 * Delete a contract
 * @param {string} contractId - Contract ID
 * @returns {Promise<boolean>} Returns true if deletion succeeded
 */
export const deleteContract = async (contractId) => {
  try {
    const result = await pool.query(
      "DELETE FROM contracts WHERE contract_id = $1 RETURNING *",
      [contractId]
    );

    if (result.rows.length === 0) {
      throw new Error("Contract not found");
    }

    return true;
  } catch (error) {
    console.error("Failed to delete contract:", error);
    throw error;
  }
};

/**
 * Update contract status
 * @param {string} contractId - Contract ID
 * @param {string} status - New status ('Accept', 'Pending', 'Active', 'Expired')
 * @returns {Promise<Object>} Updated contract details
 */
export const updateContractStatus = async (contractId, status) => {
  try {
    if (!["Accept", "Pending", "Active", "Expired"].includes(status)) {
      throw new Error("Invalid contract status");
    }

    const result = await pool.query(
      `UPDATE contracts 
       SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE contract_id = $2 
       RETURNING *`,
      [status, contractId]
    );

    if (result.rows.length === 0) {
      throw new Error("Contract not found");
    }

    return result.rows[0];
  } catch (error) {
    console.error("Failed to update contract status:", error);
    throw error;
  }
};

/**
 * Get contracts that are about to expire
 * @param {number} limit - Number of contracts to return
 * @returns {Promise<Array>} List of contracts about to expire
 */
export const getExpiringContracts = async (limit = 6) => {
  try {
    console.log("Starting to fetch expiring contracts, API_URL:", API_URL);

    const query = `
      SELECT 
        c.contract_id,
        c.subject,
        c.expiration_date,
        u.username,
        u.email,
        c.amount,
        EXTRACT(DAY FROM (c.expiration_date - CURRENT_DATE)) as days_until_expiry
      FROM contracts c
      LEFT JOIN users u ON c.user_id = u.user_id
      WHERE 
        c.expiration_date > CURRENT_DATE 
        AND c.expiration_date <= CURRENT_DATE + INTERVAL '30 days'
        AND c.status NOT IN ('Expired')
      ORDER BY c.expiration_date ASC
      LIMIT $1`;

    console.log("Executing SQL query:", query);
    console.log("Query parameters:", [limit]);

    const result = await pool.query(query, [limit]);

    console.log("Query result:", result.rows);

    const contracts = result.rows.map((contract) => ({
      ...contract,
      days_until_expiry: Math.ceil(contract.days_until_expiry),
    }));

    console.log("Processed contract data:", contracts);
    return contracts;
  } catch (error) {
    console.error("Database operation failed for expiring contracts:", error);
    throw error;
  }
};

/**
 * Get top value clients based on total contract amounts
 * @param {number} limit - Number of clients to return
 * @returns {Promise<Array>} List of top value clients
 */
export const getTopValueClients = async (limit = 6) => {
  try {
    console.log("Starting to fetch top value clients, params:", { limit });

    const query = `
      SELECT 
        u.user_id,
        u.username,
        u.email,
        COUNT(c.contract_id) as total_contracts,
        SUM(c.amount) as total_amount
      FROM users u
      LEFT JOIN contracts c ON u.user_id = c.user_id
      WHERE c.status != 'Expired'
      GROUP BY u.user_id, u.username, u.email
      ORDER BY total_amount DESC
      LIMIT $1
    `;

    console.log("Executing SQL query:", query);
    console.log("Query parameters:", [limit]);

    const result = await pool.query(query, [limit]);
    console.log("Query result:", result.rows);

    return result.rows.map((client) => ({
      ...client,
      total_amount: parseFloat(client.total_amount) || 0,
    }));
  } catch (error) {
    console.error("Failed to get top value clients:", error);
    throw error;
  }
};

/**
 * Get active contracts statistics
 * @returns {Promise<Object>} Active contracts statistics
 */
export const getActiveContracts = async () => {
  try {
    console.log("Starting to fetch active contracts statistics");

    const query = `
      SELECT 
        COUNT(*) as count,
        COUNT(*) * 100.0 / (SELECT COUNT(*) FROM contracts) as percentage
      FROM contracts 
      WHERE status = 'Active'`;

    console.log("Executing SQL query:", query);

    const result = await pool.query(query);
    console.log("Query result:", result.rows[0]);

    return {
      count: parseInt(result.rows[0].count),
      percentage: parseFloat(result.rows[0].percentage).toFixed(2),
    };
  } catch (error) {
    console.error("Failed to get active contracts statistics:", error);
    throw error;
  }
};

/**
 * Get draft contracts statistics
 * @returns {Promise<Object>} Draft contracts statistics
 */
export const getDraftContracts = async () => {
  try {
    console.log("Starting to fetch draft contracts statistics");

    const query = `
      SELECT 
        COUNT(*) as count,
        COUNT(*) * 100.0 / (SELECT COUNT(*) FROM contracts) as percentage
      FROM contracts 
      WHERE status = 'Pending'`;

    console.log("Executing SQL query:", query);

    const result = await pool.query(query);
    console.log("Query result:", result.rows[0]);

    return {
      count: parseInt(result.rows[0].count),
      percentage: parseFloat(result.rows[0].percentage).toFixed(2),
    };
  } catch (error) {
    console.error("Failed to get draft contracts statistics:", error);
    throw error;
  }
};

/**
 * Get new businesses statistics (contracts created within last 60 days)
 * @returns {Promise<Object>} New businesses statistics
 */
export const getNewBusinesses = async () => {
  try {
    console.log("Starting to fetch new business statistics");

    const query = `
      SELECT 
        COUNT(*) as count,
        COUNT(*) * 100.0 / (SELECT COUNT(*) FROM contracts) as percentage
      FROM contracts 
      WHERE created_at >= CURRENT_DATE - INTERVAL '60 days'`;

    console.log("Executing SQL query:", query);

    const result = await pool.query(query);
    console.log("Query result:", result.rows[0]);

    return {
      count: parseInt(result.rows[0].count),
      percentage: parseFloat(result.rows[0].percentage).toFixed(2),
    };
  } catch (error) {
    console.error("Failed to get new business statistics:", error);
    throw error;
  }
};

/**
 * Get contract amount distribution statistics
 * @returns {Promise<Array>} Contract amount distribution data
 */
export const getContractAmountDistribution = async () => {
  try {
    console.log("Starting to fetch contract amount distribution statistics");

    const query = `
      WITH stats AS (
        SELECT 
          MIN(amount) as min_amount,
          MAX(amount) as max_amount,
          (MAX(amount) - MIN(amount))/4 as range_size
        FROM contracts
      )
      SELECT 
        CASE 
          WHEN amount <= min_amount + range_size THEN 'Low'
          WHEN amount <= min_amount + range_size * 2 THEN 'Medium Low'
          WHEN amount <= min_amount + range_size * 3 THEN 'Medium'
          WHEN amount <= min_amount + range_size * 4 THEN 'Medium High'
          ELSE 'High'
        END as range_label,
        COUNT(*) as count,
        ROUND(AVG(amount)::numeric, 2) as avg_amount,
        MIN(amount) as min_amount,
        MAX(amount) as max_amount
      FROM contracts, stats
      GROUP BY range_label
      ORDER BY min_amount`;

    console.log("Executing SQL query:", query);

    const result = await pool.query(query);
    console.log("Query result:", result.rows);

    return result.rows.map((row) => ({
      name: row.range_label,
      value: parseInt(row.count),
      avgAmount: parseFloat(row.avg_amount),
      minAmount: parseFloat(row.min_amount),
      maxAmount: parseFloat(row.max_amount),
    }));
  } catch (error) {
    console.error(
      "Failed to get contract amount distribution statistics:",
      error
    );
    throw error;
  }
};

/**
 * Get contract status distribution statistics
 * @returns {Promise<Array>} Contract status distribution data
 */
export const getContractStatusDistribution = async () => {
  const client = await pool.connect();
  try {
    console.log("Starting to fetch contract status distribution statistics");

    const query = `
      SELECT 
        status,
        COUNT(*) as count,
        COUNT(*) * 100.0 / (SELECT COUNT(*) FROM contracts) as percentage
      FROM contracts 
      GROUP BY status
      ORDER BY count DESC
    `;

    const result = await client.query(query);
    console.log("Contract status distribution result:", result.rows);

    return result.rows.map((row) => ({
      name: row.status,
      value: parseInt(row.count),
      percentage: parseFloat(row.percentage).toFixed(2),
    }));
  } catch (error) {
    console.error("Error getting contract status distribution:", error);
    throw error;
  } finally {
    client.release();
  }
};
