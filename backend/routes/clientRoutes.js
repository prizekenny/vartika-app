const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all clients with user information
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                c.*,
                u.username,
                u.email,
                u.phone,
                u.status
            FROM 
                clients c
            JOIN 
                users u ON c.user_id = u.user_id
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create new client
router.post('/', async (req, res) => {
    const {
        user_id,
        company_name,
        contact_person,
        contact_email,
        contact_phone,
        address,
        client_type
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO clients 
            (user_id, company_name, contact_person, contact_email, contact_phone, address, client_type)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [user_id, company_name, contact_person, contact_email, contact_phone, address, client_type]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update client
router.put('/:clientId', async (req, res) => {
    const { clientId } = req.params;
    const {
        company_name,
        contact_person,
        contact_email,
        contact_phone,
        address,
        client_type
    } = req.body;

    try {
        const result = await pool.query(
            `UPDATE clients 
            SET 
                company_name = $1,
                contact_person = $2,
                contact_email = $3,
                contact_phone = $4,
                address = $5,
                client_type = $6,
                updated_at = NOW()
            WHERE client_id = $7
            RETURNING *`,
            [company_name, contact_person, contact_email, contact_phone, address, client_type, clientId]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete client
router.delete('/:clientId', async (req, res) => {
    const { clientId } = req.params;
    try {
        await pool.query('DELETE FROM clients WHERE client_id = $1', [clientId]);
        res.json({ message: 'Client deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single client
router.get('/:clientId', async (req, res) => {
    const { clientId } = req.params;
    try {
        const result = await pool.query(
            `SELECT 
                c.*,
                u.username,
                u.email,
                u.phone,
                u.status
            FROM 
                clients c
            JOIN 
                users u ON c.user_id = u.user_id
            WHERE 
                c.client_id = $1`,
            [clientId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Client not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router; 