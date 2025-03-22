import db from "../db/db.js";

export const GetBranches = async (req, res) => {
    try {
        db.query("SELECT branch_name, branch_city FROM branches", async (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Error fetching values", success: false });
            }
            res.status(200).json({ message: "Branches fetched successfully", success: true, branches: result });
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", success: false });
    }
}

export const GetUsers = (req, res) => {
    const { branch_id } = req.query;

    if (!branch_id) {
        return res.status(400).json({ message: "Branch ID is required", success: false });
    }

    db.query('SELECT * FROM users WHERE branch_id = ?', [branch_id], (err, results) => {
        if (err) {
            console.error("Error fetching users", err.message);
            return res.status(500).json({ message: 'Server error', success: false });
        }
        res.status(200).json({ message: "Users fetched successsfully", users: results, success: true });
    })
}

export const GetEvent = (req, res) => {
    const sql = 'SELECT * FROM events';
    try {
        db.query(sql, (err, results) => {
            if (err) {
                console.error(err.message);
                return res.status(500).send({ message: 'Server error', success: false });
            }
            res.status(200).json({ message: "Events fetched successsfully", events: results, success: true });
        });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", success: false })
    }
}

export const GetRequests = (req, res) => {
    const query = `
        SELECT requests.id, requests.user_id, requests.event_id, users.first_name, users.last_name, events.event_name, events.recurrence_day, requests.status, requests.date
        FROM requests
        JOIN users ON requests.user_id = users.user_id
        JOIN events ON requests.event_id = events.event_id
    `;
    db.query(query, (err, results) => {
        if (err) throw err;
        res.status(200).send(results);
    });
}

export const GetBranchesByCity = async (req, res) => {
    try {
        const query = `SELECT branch_city, branch_name, branch_id FROM branches ORDER BY branch_city`;

        db.query(query, (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Database query failed" });
            }
            res.status(200).json({ cities: results, success: true });
        });
    } catch (error) {
        console.error("Error fetching branches:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const GetBranchRequests = (req, res) => {
    const { branch_id } = req.query;

    if (!branch_id) {
        return res.status(400).json({ error: "branch_id is required" });
    }
    const query = `
        SELECT requests.id, requests.user_id, requests.event_id, 
        users.first_name, users.last_name, users.phone_number, events.event_name, 
        requests.status, requests.date
        FROM requests
        JOIN users ON requests.user_id = users.user_id
        JOIN events ON requests.event_id = events.event_id
        WHERE users.branch_id = ?
    `;
    db.query(query, [branch_id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Database query failed" });
        }

        res.status(200).json({ requests: results, success: true });
    });
}