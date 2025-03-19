const WebSocket = require('ws');
const pool = require('../config/database');

function setupWebSocket(server) {
    const wss = new WebSocket.Server({ server });
    
    wss.on('connection', (ws) => {
        console.log('New client connected');
        
        // Send initial data
        sendInitialData(ws);
        
        // Listen for client updates
        ws.on('message', async (message) => {
            try {
                const data = JSON.parse(message);
                console.log('Received message:', data.type);
                
                switch(data.type) {
                    case 'UPDATE':
                        await handleClientUpdate(data);
                        broadcastUpdate(wss, data);
                        break;
                    case 'CREATE':
                        await handleClientCreate(data);
                        broadcastCreate(wss, data);
                        break;
                    case 'DELETE':
                        await handleClientDelete(data);
                        broadcastDelete(wss, data);
                        break;
                    default:
                        console.log('Unknown message type:', data.type);
                }
            } catch (err) {
                console.error('Error handling message:', err);
                ws.send(JSON.stringify({
                    type: 'ERROR',
                    message: 'Failed to process your request'
                }));
            }
        });
        
        // Handle disconnection
        ws.on('close', () => {
            console.log('Client disconnected');
        });
        
        // Handle errors
        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
    });
    
    // Heartbeat to keep connections alive
    const interval = setInterval(() => {
        wss.clients.forEach((ws) => {
            if (ws.isAlive === false) return ws.terminate();
            
            ws.isAlive = false;
            ws.ping();
        });
    }, 30000);
    
    wss.on('close', () => {
        clearInterval(interval);
    });
}

async function sendInitialData(ws) {
    try {
        const result = await pool.query(
            `SELECT 
                user_id, 
                username, 
                email, 
                phone, 
                status, 
                address,
                client_type,
                open_time,
                remark,
                last_sync 
            FROM users 
            WHERE user_type = $1`,
            ['Client']
        );
        ws.send(JSON.stringify({
            type: 'INITIAL_DATA',
            data: result.rows
        }));
    } catch (err) {
        console.error('Error sending initial data:', err);
        ws.send(JSON.stringify({
            type: 'ERROR',
            message: 'Failed to load initial data'
        }));
    }
}

async function handleClientUpdate(data) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // Update user data with all fields
        const updateQuery = `
            UPDATE users 
            SET 
                username = $1, 
                email = $2, 
                phone = $3,
                address = $4,
                client_type = $5,
                open_time = $6,
                status = $7,
                remark = $8,
                updated_at = NOW(),
                last_sync = NOW()
            WHERE user_id = $9
            RETURNING *
        `;
        
        const updateResult = await client.query(updateQuery, [
            data.username,
            data.email,
            data.phone,
            data.address || null,
            data.client_type || 'Individual',
            data.open_time || null,
            data.status || 'active',
            data.remark || null,
            data.userId
        ]);
        
        // Record change
        await client.query(
            `INSERT INTO client_changes 
            (client_id, change_type, changed_fields) 
            VALUES ($1, $2, $3)`,
            [data.userId, 'UPDATE', JSON.stringify(data)]
        );
        
        await client.query('COMMIT');
        return updateResult.rows[0];
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Database error during update:', err);
        throw err;
    } finally {
        client.release();
    }
}

async function handleClientCreate(data) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // Create new user
        const createQuery = `
            INSERT INTO users 
            (username, email, phone, address, client_type, open_time, status, remark, user_type) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;
        
        const createResult = await client.query(createQuery, [
            data.username,
            data.email,
            data.phone || null,
            data.address || null,
            data.client_type || 'Individual',
            data.open_time || null,
            data.status || 'active',
            data.remark || null,
            'Client'
        ]);
        
        const newUser = createResult.rows[0];
        
        // Record change
        await client.query(
            `INSERT INTO client_changes 
            (client_id, change_type, changed_fields) 
            VALUES ($1, $2, $3)`,
            [newUser.user_id, 'CREATE', JSON.stringify(newUser)]
        );
        
        await client.query('COMMIT');
        return newUser;
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Database error during create:', err);
        throw err;
    } finally {
        client.release();
    }
}

async function handleClientDelete(data) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // Delete user (or set as inactive)
        const deleteQuery = `
            UPDATE users 
            SET 
                status = 'inactive',
                updated_at = NOW()
            WHERE user_id = $1
            RETURNING *
        `;
        
        const deleteResult = await client.query(deleteQuery, [data.userId]);
        
        // Record change
        await client.query(
            `INSERT INTO client_changes 
            (client_id, change_type, changed_fields) 
            VALUES ($1, $2, $3)`,
            [data.userId, 'DELETE', JSON.stringify(data)]
        );
        
        await client.query('COMMIT');
        return deleteResult.rows[0];
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Database error during delete:', err);
        throw err;
    } finally {
        client.release();
    }
}

function broadcastUpdate(wss, data) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'UPDATE',
                data: data
            }));
        }
    });
}

function broadcastCreate(wss, data) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'CREATE',
                data: data
            }));
        }
    });
}

function broadcastDelete(wss, data) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'DELETE',
                data: data
            }));
        }
    });
}

module.exports = setupWebSocket; 