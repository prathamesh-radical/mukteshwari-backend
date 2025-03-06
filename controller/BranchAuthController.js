import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../db/db.js";

export const BranchRegister = (req, res) => {
    const query = `
        SELECT requests.id, requests.user_id, requests.event_id,
        users.name AS userName, users.phone_number, users.branch_id,
        events.event_name AS eventName, requests.status, requests.date
        FROM requests
        JOIN users ON requests.user_id = users.user_id
        JOIN events ON requests.event_id = events.event_id
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Database query failed" });
        }
        res.status(200).json({ requests: results, success: true });
    });
}

export const BranchLogin = async (req, res) => {
    const { branch_username, branch_password } = req.body;

    if (!branch_username || !branch_password) {
        return res.status(400).json({ message: "All fields are required", success: false });
    }
    try {
        db.query(
            "SELECT * FROM branches WHERE branch_username = ?",
            [branch_username],
            async (err, result) => {
                if (err) {
                    return res.status(500).json({ message: "Error fetching values", success: false });
                }
                if (result.length > 0) {
                    const isPasswordValid = await bcrypt.compare(branch_password, result[0].branch_password);
                    if (isPasswordValid) {
                        const token = jwt.sign(
                            { id: result[0].branch_id, branch_username: result[0].branch_username },
                            process.env.JWT_SECRET,
                            { expiresIn: "2h" }
                        )
                        res.status(200).json({
                            message: `Welcome ${result[0].branch_manager_name}! You have successfully logged in. 🎉`,
                            success: true,
                            branchId: result[0].branch_id,
                            branchToken: token,
                            branchName: result[0].branch_name,
                            branchCity: result[0].branch_city,
                        });
                    } else {
                        res.status(401).json({ message: "Invalid credentials", success: false });
                    }
                } else {
                    res.status(401).json({ message: "Invalid credentials", success: false });
                }
            }
        );
    } catch (error) {
        res.status(500).json({ message: "Internal server error", success: false });
    }
}