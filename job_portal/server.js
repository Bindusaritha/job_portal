
// ==============================================================================
// Online Job Portal - Express Backend Server
// Database: job_portal | Table: jobs
// ==============================================================================

const express = require("express");
const mysql = require("mysql8");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON requests and static files
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// MySQL Database Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Nidiganti@2006",
    database: "job_portal",
    dateStrings: true // Returns dates as 'YYYY-MM-DD' strings for clean display
});

// Connect to Database
db.connect((err) => {
    if (err) {
        console.error("❌ MySQL Connection Failed:", err.message);
        return;
    }
    console.log("✅ Connected to MySQL Database (job_portal)");
});

// ------------------------------------------------------------------------------
// 1. GET ALL JOBS
// ------------------------------------------------------------------------------
app.get("/jobs", (req, res) => {
    const query = "SELECT * FROM jobs ORDER BY job_id ASC";
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching jobs:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// ------------------------------------------------------------------------------
// 2. GET SINGLE JOB BY ID
// ------------------------------------------------------------------------------
app.get("/jobs/:id", (req, res) => {
    const query = "SELECT * FROM jobs WHERE job_id = ?";
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            console.error("Error fetching job:", err);
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: "Job Not Found" });
        }
        res.json(results);
    });
});

// ------------------------------------------------------------------------------
// 3. POST / CREATE NEW JOB
// ------------------------------------------------------------------------------
app.post("/jobs", (req, res) => {
    const { job_id, company, location, salary, skills, interview_date, posts } = req.body;

    if (!job_id || !company || !location || !salary || !skills || !interview_date || posts === undefined) {
        return res.status(400).send("Please provide all 7 required job fields.");
    }

    const query = `
        INSERT INTO jobs (job_id, company, location, salary, skills, interview_date, posts)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        query,
        [job_id, company, location, salary, skills, interview_date, parseInt(posts, 10)],
        (err) => {
            if (err) {
                console.error("Error creating job:", err);
                return res.status(500).send("Database Error: " + err.message);
            }
            res.status(201).send("Job Posted Successfully!");
        }
    );
});

// ------------------------------------------------------------------------------
// 4. PUT / UPDATE EXISTING JOB
// ------------------------------------------------------------------------------
app.put("/jobs/:id", (req, res) => {
    const { company, location, salary, skills, interview_date, posts } = req.body;

    const query = `
        UPDATE jobs
        SET company = ?, location = ?, salary = ?, skills = ?, interview_date = ?, posts = ?
        WHERE job_id = ?
    `;

    db.query(
        query,
        [company, location, salary, skills, interview_date, parseInt(posts, 10), req.params.id],
        (err, result) => {
            if (err) {
                console.error("Error updating job:", err);
                return res.status(500).send("Database Error: " + err.message);
            }
            if (result.affectedRows === 0) {
                return res.status(404).send("Job ID Not Found to Update");
            }
            res.send("Job Updated Successfully!");
        }
    );
});

// ------------------------------------------------------------------------------
// 5. DELETE JOB
// ------------------------------------------------------------------------------
app.delete("/jobs/:id", (req, res) => {
    const query = "DELETE FROM jobs WHERE job_id = ?";
    db.query(query, [req.params.id], (err, result) => {
        if (err) {
            console.error("Error deleting job:", err);
            return res.status(500).send("Database Error: " + err.message);
        }
        if (result.affectedRows === 0) {
            return res.status(404).send("Job ID Not Found to Delete");
        }
        res.send("Job Deleted Successfully!");
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Online Job Portal server running at http://localhost:${PORT}`);
});
