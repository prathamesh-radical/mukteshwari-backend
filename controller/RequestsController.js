import db from "../db/db.js";

export const AddRequests = async (req, res) => {
    const { user_id, event_id, date } = req.body;

    if (!user_id || !event_id || !date) {
        return res.status(400).json({
            message: "User ID, Event ID, and Date are required",
            success: false
        });
    }

    try {
        if (date.trim() === "") {
            return res.status(400).json({
                message: "Date cannot be empty",
                success: false
            });
        }

        const query = `
            INSERT INTO requests (user_id, event_id, date)
            VALUES (?, ?, ?)
        `;
        db.query(query, [user_id, event_id, date], (err, result) => {
            if (err) {
                console.error(err.message);
                return res.status(500).json({ message: 'Server error', success: false });
            }

            const request_id = result.insertId;

            const updateUserQuery = `UPDATE users SET request_id = ? WHERE user_id = ?`;
            db.execute(updateUserQuery, [request_id, user_id], (updateErr) => {
                if (updateErr) {
                    console.error(updateErr.message);
                    return res.status(500).json({ message: 'Error updating user', success: false });
                }

                res.status(201).json({
                    message: "Request created successfully",
                    success: true
                });
            });
        });

    } catch (error) {
        console.error("Error creating request:", error);
        res.status(500).json({ message: "Internal Server error", success: false });
    }
}

export const UpdateRequests = (req, res) => {
    const { id, status } = req.body;

    const query = 'UPDATE requests SET status = ? WHERE id = ?';
    db.query(query, [status, id], (err, result) => {
        if (err) throw err;
        res.send({ message: 'Request status updated successfully' });
    });
}

export const UpdateBulkRequests = (req, res) => {
    const { ids, status } = req.body;

    if (!ids || !ids.length || !status) {
        return res.status(400).send({ message: 'Invalid request: IDs and status are required' });
    }

    const query = 'UPDATE requests SET status = ? WHERE id IN (?)';
    db.query(query, [status, ids], (err, result) => {
        if (err) {
            console.error('Error updating bulk requests:', err);
            return res.status(500).send({ message: 'Failed to update bulk requests' });
        }
        res.send({ message: 'Bulk requests status updated successfully' });
    });
}

export const InsertRequests = (req, res) => {
    const { user_id, event_id, date, status } = req.body;

    db.query("SELECT user_id, event_id, date FROM requests WHERE user_id = ? AND event_id = ? AND date = ?",
        [user_id, event_id, date], (err, result) => {
            if (err) {
                console.log("Error:", err);
                return res.status(500).json({ message: 'Error checking request', success: false });
            }
            if (result.length > 0) {
                const query = 'UPDATE requests SET status = ? WHERE user_id = ? AND event_id = ? AND date = ?';
                db.query(query, [status, user_id, event_id, date], (err, result) => {
                    if (err) {
                        console.log("Error:", err);
                        return res.status(500).json({ message: 'Error updating request', success: false });
                    }
                    res.status(200).json({ message: 'Request status updated successfully', success: true });
                });
            } else {
                const query = 'INSERT INTO requests (user_id, event_id, date, status) VALUES (?, ?, ?, ?)';
                db.query(query, [user_id, event_id, date, status], (err, result) => {
                    if (err) {
                        console.log("Error:", err);
                        return res.status(500).json({ message: 'Error inserting request', success: false });
                    }
                    res.status(200).json({ message: 'Request status inserted successfully', success: true });
                });
            }
        });
};

export const InsertRequestsInBulk = (req, res) => {
    const requests = req.body;
    console.log("Requests in InsertRequestsInBulk: ", requests);

    const sql = 'INSERT INTO requests (user_id, event_id, date, status) VALUES ?';
    const values = requests?.map(req => [req.user_id, req.event_id, req.date, req.status]);

    db.query(sql, [values], (err, result) => {
        if (err) {
            console.error('Error inserting bulk requests:', err);
            return res.status(500).send({ message: 'Failed to insert bulk requests' });
        }
        res.send({ message: 'Bulk requests added successfully' });
    });
}