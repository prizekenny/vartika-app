/**
 * clients.js
 *
 * Express router for handling CRUD operations on the 'clients' table.
 * Provides endpoints to create, read, update, and delete client records.
 * Uses parameterized queries to interact with the PostgreSQL database securely.
 */

import express from "express";
import { pool } from "../config/database.js";
const router = express.Router();

// GET /api/clients - Fetch all clients
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM clients ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching clients:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/clients/:id - Fetch a single client by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM clients WHERE client_id = $1",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Client not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(`Error fetching client with id ${id}:`, err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/clients - Create a new client
router.post("/", async (req, res) => {
  const {
    user_id,
    type,
    client_name,
    contact_email,
    phone,
    address,
    contact_name,
    position,
    tax_id,
    currency,
    payment_terms,
    country,
    province_state,
    city,
    postal_code,
    qb_display_name,
    qb_last_synced_at,
    qb_customer_id,
    status,
    remark,
  } = req.body;

  try {
    const query = `
            INSERT INTO clients (
                user_id,
                type,
                client_name,
                contact_email,
                phone,
                address,
                contact_name,
                position,
                tax_id,
                currency,
                payment_terms,
                country,
                province_state,
                city,
                postal_code,
                qb_display_name,
                qb_last_synced_at,
                qb_customer_id,
                status,
                remark
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
            )
            RETURNING *;
        `;

    const values = [
      user_id,
      type,
      client_name,
      contact_email,
      phone,
      address,
      contact_name,
      position,
      tax_id,
      currency,
      payment_terms,
      country,
      province_state,
      city,
      postal_code,
      qb_display_name,
      qb_last_synced_at,
      qb_customer_id,
      status,
      remark,
    ];

    console.log("create client :", req.body);

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating client:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/clients/:id - Update a client by ID
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    console.log("update client :", req.body, " id:", id);
    // Check if client exists
    const existing = await pool.query(
      "SELECT * FROM clients WHERE client_id = $1",
      [id]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Client not found" });
    }

    const fields = [];
    const values = [];
    let idx = 1;

    for (const key in req.body) {
      if (key === "client_id") continue;
      if (req.body[key] !== undefined) {
        fields.push(`${key} = $${idx}`);
        values.push(req.body[key]);
        idx++;
      }
    }

    fields.push(`updated_at = NOW()`);
    const query = `
      UPDATE clients SET
        ${fields.join(", ")}
      WHERE client_id = $${idx}
      RETURNING *;
    `;
    values.push(id);

    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(`Error updating client with id ${id}:`, err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/clients/:id - Delete a client by ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM clients WHERE client_id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Client not found" });
    }
    res.json({ message: "Client deleted successfully" });
  } catch (err) {
    console.error(`Error deleting client with id ${id}:`, err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
