import db from '../db/DbConnect.js';

const AddEvent = async (req, res) => {
    const { event_name, description, start_time, start_date, is_recurring, recurrence_pattern, recurrence_day } = req.body;

    console.log(req.body)

    const sql = `
    INSERT INTO events (event_name, description, start_time, start_date, is_recurring, recurrence_pattern, recurrence_day) VALUES (?, ?, ?, ?, ?, ?, ?)`;

    const values = [event_name, description, start_time, start_date, is_recurring || false, recurrence_pattern || 'none', recurrence_day || null];

    try {
        db.query(sql, values, (err, result) => {
            if (err) {
                console.error(err.message);
                return res.status(500).json({ message: 'Server error', success: false });
            }
            res.status(201).json({ message: 'Event created successfully', success: true });
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", success: false })
    }
}

export { AddEvent }