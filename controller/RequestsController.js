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
    const { id } = req.params;
    const { status } = req.body;
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
        console.log("Successfully updated bulk requests ", result);

        res.send({ message: 'Bulk requests status updated successfully' });
    });
}

export const InsertRequests = (req, res) => {
    const { user_id, event_id, date, status } = req.body;

    const query = 'INSERT INTO requests (user_id, event_id, date, status) VALUES (?, ?, ?, ?)';
    db.query(query, [user_id, event_id, date, status], (err, result) => {
        if (err) {
            console.log("err", err);
            return res.status(500).json({ message: 'Error updating user', success: false });
        }

        res.status(200).json({ message: 'Request status updated successfully', success: true });
    });
};

export const InsertRequestsInBulk = (req, res) => {
    const requests = req.body;
    const sql = 'INSERT INTO requests (user_id, event_id, date, status) VALUES ?';
    const values = requests.map(req => [req.user_id, req.event_id, req.date, req.status]);

    db.query(sql, [values], (err, result) => {
        if (err) {
            console.log("err", err);
            return res.status(500).json({ message: 'Error updating user', success: false });
        }

        res.status(200).json({ message: 'Bulk requests added successfully', success: true });
    });
}