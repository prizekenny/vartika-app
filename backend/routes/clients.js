import express from 'express';
import pkg from 'pg';
import { pool } from "../config/database.js";


const router = express.Router();

// Get all clients
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                u.user_id,
                u.username,
                u.email,
                u.phone,
                u.status,
                c.client_type,
                c.created_at as register_time,
                c.company_name,
                c.contact_person,
                c.contact_email,
                c.contact_phone,
                c.address
            FROM users u
            JOIN user_roles ur ON u.user_id = ur.user_id
            JOIN roles r ON ur.role_id = r.role_id
            LEFT JOIN clients c ON u.user_id = c.user_id
            WHERE r.role_name = 'Client'
            ORDER BY u.created_at DESC
        `);
        
        const transformedData = result.rows.map(row => ({
            user_id: row.user_id,
            username: row.username || row.contact_person,
            email: row.email || row.contact_email,
            phone: row.phone || row.contact_phone,
            status: row.status,
            client_type: row.client_type || 'Individual',
            register_time: row.register_time,
            company_name: row.company_name,
            address: row.address
        }));

        res.status(200).json(transformedData);
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ message: 'Failed to fetch clients' });
    }
});

// Get a specific client
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT 
                u.user_id, 
                u.username, 
                u.email, 
                u.phone, 
                u.status,
                c.address, 
                c.client_type, 
                c.created_at as register_time,
                c.company_name,
                c.contact_person,
                c.contact_email,
                c.contact_phone,
                c.remark
            FROM users u
            LEFT JOIN clients c ON u.user_id = c.user_id
            WHERE u.user_id = $1
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Client not found' });
        }
        
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching client:', error);
        res.status(500).json({ message: 'Failed to fetch client', error: error.message });
    }
});

// Create a new client
router.post('/', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const { username, email, phone, address, client_type, status, company_name, remark } = req.body;
        
        // Insert into users table (移除address欄位)
        const userResult = await client.query(`
            INSERT INTO users (username, email, password, phone, status, user_type)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING user_id
        `, [username, email, 'default_password', phone, status || 'active', 'Client']);
        
        const userId = userResult.rows[0].user_id;
        
        // 插入到 clients 表
        await client.query(`
            INSERT INTO clients (user_id, company_name, client_type, address, remark)
            VALUES ($1, $2, $3, $4, $5)
        `, [userId, company_name, client_type, address, remark]);
        
        // Assign Client role
        await client.query(`
            INSERT INTO user_roles (user_id, role_id)
            SELECT $1, role_id FROM roles WHERE role_name = 'Client'
        `, [userId]);
        
        await client.query('COMMIT');
        
        res.status(201).json({
            user_id: userId,
            username,
            email,
            phone,
            status,
            address,
            client_type,
            company_name,
            remark
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating client:', error);
        res.status(500).json({ message: 'Failed to create client', error: error.message });
    } finally {
        client.release();
    }
});

// Update a client
router.put('/:id', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const { id } = req.params;
        const { 
            username, 
            email, 
            phone, 
            client_type, 
            status, 
            address,
            company_name,
            remark 
        } = req.body;

        console.log('Updating client:', { id, ...req.body });

        // 更新 users 表
        await client.query(`
            UPDATE users
            SET username = $1, 
                email = $2, 
                phone = $3, 
                status = $4,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $5
        `, [username, email, phone, status, id]);

        // 更新 clients 表 (包含 remark 欄位)
        await client.query(`
            UPDATE clients
            SET company_name = $1,
                client_type = $2,
                address = $3,
                remark = $4,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $5
        `, [company_name, client_type, address, remark, id]);

        await client.query('COMMIT');
        
        res.status(200).json({
            message: '客戶資料更新成功',
            user_id: id
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating client:', error);
        res.status(500).json({ 
            message: '更新客戶資料失敗', 
            error: error.message,
            details: error.stack 
        });
    } finally {
        client.release();
    }
});

// Delete a client
router.delete('/:id', async (req, res) => {
    const clientConnection = await pool.connect();
    try {
        await clientConnection.query('BEGIN');
        
        const { id } = req.params;
        
        // 1. 先刪除 clients 表中的記錄
        console.log(`嘗試刪除 clients 表中的記錄，user_id: ${id}`);
        await clientConnection.query(`
            DELETE FROM clients WHERE user_id = $1
        `, [id]);
        
        // 然後刪除 user_roles 表中的相關記錄
        await clientConnection.query(`
            DELETE FROM user_roles WHERE user_id = $1
        `, [id]);
        
        // 3. 最後刪除 users 表中的記錄
        console.log(`嘗試刪除 users 表中的記錄，user_id: ${id}`);
        const result = await clientConnection.query(`
            DELETE FROM users WHERE user_id = $1 RETURNING user_id
        `, [id]);
        
        if (result.rows.length === 0) {
            await clientConnection.query('ROLLBACK');
            return res.status(404).json({ message: '找不到指定客戶' });
        }
        
        await clientConnection.query('COMMIT');
        console.log(`成功刪除客戶，user_id: ${id}`);
        
        res.status(200).json({ 
            message: '客戶刪除成功', 
            user_id: id 
        });
    } catch (error) {
        await clientConnection.query('ROLLBACK');
        console.error('刪除客戶時發生錯誤:', error);
        
        // 返回詳細錯誤信息，便於調試
        res.status(500).json({ 
            message: '刪除客戶失敗', 
            error: error.message,
            detail: error.detail,
            code: error.code
        });
    } finally {
        clientConnection.release();
    }
});

export default router; 