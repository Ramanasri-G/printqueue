const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static("public"));

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "printqueue"
});

db.connect((err) => {

    if (err) {
        console.log("MySQL connection failed");
        console.log(err.message);
    } else {
        console.log("MySQL connected");
    }

});


/* HOME */

app.get("/", (req, res) => {

    res.sendFile(
        __dirname + "/public/index.html"
    );

});


/* REGISTER */

app.post("/register", (req, res) => {

    const {
        name,
        email,
        password
    } = req.body;

    const sql = `
        INSERT INTO users
        (name, email, password)
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [name, email, password],
        (err, result) => {

            if (err) {

                return res.status(400).json({
                    message: "Email already exists"
                });

            }

            res.json({
                message: "Registration successful"
            });

        }
    );

});


/* LOGIN */

app.post("/login", (req, res) => {

    const {
        email,
        password
    } = req.body;

    const sql = `
        SELECT *
        FROM users
        WHERE email = ?
        AND password = ?
    `;

    db.query(
        sql,
        [email, password],
        (err, result) => {

            if (err) {

                return res.status(500).json({
                    message: "Database error"
                });

            }

            if (result.length === 0) {

                return res.status(401).json({
                    message: "Invalid email or password"
                });

            }

            res.json(result[0]);

        }
    );

});


/* CREATE PRINT REQUEST */

app.post("/print", (req, res) => {

    const {
        user_id,
        file_name,
        copies,
        print_type
    } = req.body;

    const queueSQL = `
        SELECT COUNT(*) AS total
        FROM print_requests
        WHERE status = 'Waiting'
    `;

    db.query(
        queueSQL,
        (err, result) => {

            if (err) {

                return res.status(500).json({
                    message: "Queue error"
                });

            }

            const queueNumber =
                result[0].total + 1;

            const sql = `
                INSERT INTO print_requests
                (
                    user_id,
                    file_name,
                    copies,
                    print_type,
                    queue_number
                )
                VALUES (?, ?, ?, ?, ?)
            `;

            db.query(
                sql,
                [
                    user_id,
                    file_name,
                    copies,
                    print_type,
                    queueNumber
                ],
                (err) => {

                    if (err) {

                        return res.status(500).json({
                            message: "Request failed"
                        });

                    }

                    res.json({
                        message:
                            "Print request submitted",
                        queueNumber
                    });

                }
            );

        }
    );

});


/* STUDENT REQUESTS */

app.get(
    "/requests/:userId",
    (req, res) => {

        const sql = `
            SELECT *
            FROM print_requests
            WHERE user_id = ?
            ORDER BY id DESC
        `;

        db.query(
            sql,
            [req.params.userId],
            (err, result) => {

                if (err) {

                    return res.status(500).json({
                        message: "Database error"
                    });

                }

                res.json(result);

            }
        );

    }
);


/* ADMIN REQUESTS */

app.get("/admin", (req, res) => {

    const sql = `
        SELECT
            print_requests.*,
            users.name,
            users.email
        FROM print_requests
        JOIN users
        ON print_requests.user_id = users.id
        ORDER BY queue_number
    `;

    db.query(
        sql,
        (err, result) => {

            if (err) {

                return res.status(500).json({
                    message: "Database error"
                });

            }

            res.json(result);

        }
    );

});


/* UPDATE STATUS */

app.put(
    "/status/:id",
    (req, res) => {

        const {
            status
        } = req.body;

        const sql = `
            UPDATE print_requests
            SET status = ?
            WHERE id = ?
        `;

        db.query(
            sql,
            [
                status,
                req.params.id
            ],
            (err) => {

                if (err) {

                    return res.status(500).json({
                        message: "Update failed"
                    });

                }

                res.json({
                    message: "Status updated"
                });

            }
        );

    }
);


app.listen(5000, () => {

    console.log(
        "PrintQueue running at http://localhost:5000"
    );

});