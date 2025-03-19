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

    if (!Array.isArray(requests) || requests.length === 0) {
        return res.status(400).json({ message: "Invalid request data", success: false });
    }

    const checkQuery = `SELECT user_id, event_id, date FROM requests WHERE (user_id, event_id, date) IN (${requests.map(() => "(?, ?, ?)").join(", ")})`;
    const checkValues = requests.flatMap(req => [req.user_id, req.event_id, req.date]);

    db.query(checkQuery, checkValues, (err, existingResults) => {
        if (err) {
            console.error("Error checking existing requests:", err);
            return res.status(500).json({ message: "Error checking requests", success: false });
        }
        const existingSet = new Set(
            existingResults.map(row => `${row.user_id}-${row.event_id}-${row.date}`)
        );
        const updates = [];
        const inserts = [];

        requests.forEach(req => {
            const key = `${req.user_id}-${req.event_id}-${req.date}`;
            if (existingSet.has(key)) {
                updates.push(req);
            } else {
                inserts.push(req);
            }
        });

        if (updates.length > 0) {
            const updateQuery = `UPDATE requests SET status = CASE ${updates.map(() => "WHEN user_id = ? AND event_id = ? AND date = ? THEN ?").join(" ")} END WHERE (user_id, event_id, date) IN (${updates.map(() => "(?, ?, ?)").join(", ")})`;

            const updateValues = updates.flatMap(req => [req.user_id, req.event_id, req.date, req.status])
                .concat(updates.flatMap(req => [req.user_id, req.event_id, req.date]));

            db.query(updateQuery, updateValues, (err) => {
                if (err) {
                    console.error("Error updating requests:", err);
                    return res.status(500).json({ message: "Error updating requests", success: false });
                }
            });
        }

        if (inserts.length > 0) {
            const insertQuery = `INSERT INTO requests (user_id, event_id, date, status) VALUES ?`;

            const insertValues = inserts.map(req => [req.user_id, req.event_id, req.date, req.status]);

            db.query(insertQuery, [insertValues], (err) => {
                if (err) {
                    console.error("Error inserting requests:", err);
                    return res.status(500).json({ message: "Error inserting requests", success: false });
                }
            });
        }

        res.status(200).json({ message: "Bulk requests processed successfully", success: true });
    });
};