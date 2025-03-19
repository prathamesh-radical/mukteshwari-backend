import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../db/db.js";

export const checkPhoneNumber = (req, res) => {
    const { phone_number } = req.body;

    const phonePattern = /^[0-9]{10}$/;
    if (!phonePattern.test(phone_number)) {
        return res.status(400).json({ message: "Please enter a valid 10-digit phone number.", success: false });
    }

    if (!phone_number) {
        return res.status(400).json({ message: "Phone number is required", success: false });
    }

    db.query("SELECT * FROM users WHERE phone_number = ?", [phone_number], (err, result) => {
        if (err) {
            console.log("Database error:", err);
            return res.status(500).json({ message: "Database error", success: false });
        }

        if (result.length > 0) {
            return res.status(400).json({ message: "User already exists!", success: false });
        }

        return res.status(200).json({ message: "Phone number is available", success: true });
    });
};

export const UserRegister = async (req, res) => {
    const {
        first_name, last_name, city, phone_number, password, confirm_password, branch_name
    } = req.body;

    if (
        !first_name || !last_name || !city || !phone_number || !password || !confirm_password || !branch_name
    ) {
        return res.status(400).json({ message: "All fields are required", success: false });
    }

    if (password !== confirm_password) {
        return res.status(400).json({ message: "Passwords do not match", success: false });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.query("SELECT branch_id FROM branches WHERE branch_name = ?", [branch_name], (err, branchResult) => {
            if (err || branchResult.length === 0) {
                return res.status(400).json({ message: "Invalid branch name", success: false });
            }
            const branch_id = branchResult[0].branch_id;

            db.query("SELECT * FROM users WHERE phone_number = ?", [phone_number], (err, result) => {
                if (result.length > 0) {
                    return res.status(400).json({ message: "User already exists", success: false });
                } else {
                    db.query(
                        "INSERT INTO users (first_name, last_name, city, phone_number, password, branch_name, branch_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
                        [first_name, last_name, city, phone_number, hashedPassword, branch_name, branch_id],
                        (err, result) => {
                            if (err) {
                                console.log("Database error:", err);
                                return res.status(500).json({ message: "Error while registering you", success: false });
                            }
                            return res.status(200).json({ message: "User Registered Successfully", success: true });
                        }
                    );
                }
            });
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", success: false })
    }
}

export const UserLogin = async (req, res) => {
    const { phone_number, password } = req.body;

    try {
        db.query("SELECT * FROM users WHERE phone_number = ?", [phone_number], async (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Error fetching values", success: false });
            }
            if (result.length > 0) {
                const isPasswordValid = await bcrypt.compare(password, result[0].password);
                if (isPasswordValid) {
                    const token = jwt.sign(
                        { id: result[0].user_id, phone_number: result[0].phone_number },
                        process.env.JWT_SECRET,
                        { expiresIn: "2h" }
                    );
                    return res.status(200).json({
                        message: `Welcome ${result[0].first_name + " " + result[0].last_name}! You have successfully logged in. 🎉`,
                        success: true,
                        userId: result[0].user_id,
                        userToken: token,
                        userNumber: phone_number,
                        userName: result[0].first_name + " " + result[0].last_name,
                    });
                } else {
                    return res.status(401).json({ message: "Invalid Credential", success: false });
                }
            }
            else {
                return res.status(401).json({ message: "Invalid Credential", success: false });
            }
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", success: false });
    }
}