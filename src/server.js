require('dotenv').config();

const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const multer = require('multer');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const pgSession = require('connect-pg-simple')(session);

const app = express();
const PORT = process.env.PORT || 5001;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
const BCRYPT_ROUNDS = 12;

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: Number(process.env.PGPORT) || 5432,
});

app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'build')));
app.use('/postUploads', express.static(path.join(__dirname, 'postUploads')));

app.use(session({
    store: new pgSession({ pool, tableName: 'session' }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
}));

// ─── Auth ────────────────────────────────────────────────────────────────────

app.post('/users', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).send('Name, email and password are required.');
    }
    try {
        const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
        await pool.query(
            'INSERT INTO public."Users" ("name", "email", "password") VALUES ($1, $2, $3)',
            [name, email, passwordHash],
        );
        res.status(201).send('User created');
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).send('Error creating user');
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query(
            'SELECT user_id, name, password FROM public."Users" WHERE email = $1',
            [email],
        );
        const user = result.rows[0];
        if (!user) {
            return res.status(401).send('Invalid email or password');
        }

        const stored = user.password || '';
        const looksHashed = stored.startsWith('$2a$') || stored.startsWith('$2b$') || stored.startsWith('$2y$');

        let valid = false;
        if (looksHashed) {
            valid = await bcrypt.compare(password, stored).catch(() => false);
        } else if (stored === password) {
            // Legacy plaintext password — accept once, then upgrade to bcrypt in place.
            valid = true;
            const upgraded = await bcrypt.hash(password, BCRYPT_ROUNDS);
            await pool.query(
                'UPDATE public."Users" SET "password" = $1 WHERE user_id = $2',
                [upgraded, user.user_id],
            );
        }

        if (!valid) {
            return res.status(401).send('Invalid email or password');
        }

        req.session.userId = user.user_id;
        req.session.userName = user.name;
        req.session.save((err) => {
            if (err) {
                console.error('Error saving session:', err);
                return res.status(500).send('Error saving session');
            }
            res.json({
                message: 'Login successful',
                userName: user.name,
                userId: user.user_id,
            });
        });
    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).send('Error logging in');
    }
});

app.get('/session', (req, res) => {
    if (req.session.userId) {
        res.json({ userId: req.session.userId, userName: req.session.userName });
    } else {
        res.status(401).send('User not authenticated');
    }
});

// ─── Lessons & Questions ─────────────────────────────────────────────────────

app.get('/question/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM "Questions" WHERE question_id = $1',
            [req.params.id],
        );
        res.json(result.rows[0] || null);
    } catch (err) {
        console.error('Error retrieving question:', err);
        res.status(500).json({ message: 'Error retrieving question' });
    }
});

app.get('/questions/:lessonId', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM "Questions" WHERE lesson_id = $1',
            [req.params.lessonId],
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error retrieving questions:', err);
        res.status(500).json({ message: 'Error retrieving questions' });
    }
});

// ─── Spaced repetition ───────────────────────────────────────────────────────

const REVIEW_INTERVALS = [1, 3, 7, 14, 30];

app.post('/updateReviewSchedule', async (req, res) => {
    const { userId, questionId, wasCorrect } = req.body;
    try {
        const existing = await pool.query(
            'SELECT * FROM user_progress WHERE user_id = $1 AND question_id = $2',
            [userId, questionId],
        );
        const progress = existing.rows[0];

        if (!progress) {
            await pool.query(
                'INSERT INTO user_progress (user_id, question_id, last_review_date, next_review_interval) VALUES ($1, $2, $3, $4)',
                [userId, questionId, new Date(), REVIEW_INTERVALS[0]],
            );
        } else {
            const currentIndex = REVIEW_INTERVALS.indexOf(progress.next_review_interval);
            const nextInterval = wasCorrect
                ? REVIEW_INTERVALS[Math.min(currentIndex + 1, REVIEW_INTERVALS.length - 1)]
                : REVIEW_INTERVALS[0];

            await pool.query(
                'UPDATE user_progress SET last_review_date = $1, next_review_interval = $2 WHERE user_id = $3 AND question_id = $4',
                [new Date(), nextInterval, userId, questionId],
            );
        }
        res.send('Review schedule updated');
    } catch (err) {
        console.error('Error updating review schedule:', err);
        res.status(500).send('Error updating review schedule');
    }
});

app.get('/getItemsForReview', async (req, res) => {
    const { userId } = req.query;
    const now = Date.now();
    try {
        const result = await pool.query(
            'SELECT question_id, last_review_date, next_review_interval FROM user_progress WHERE user_id = $1',
            [userId],
        );
        const due = result.rows
            .filter((row) => {
                const days = (now - new Date(row.last_review_date).getTime()) / (1000 * 60 * 60 * 24);
                return days >= row.next_review_interval;
            })
            .map((row) => row.question_id);
        res.json(due);
    } catch (err) {
        console.error('Error getting items for review:', err);
        res.status(500).send('Error getting items for review');
    }
});

// ─── Posts (community feed) ──────────────────────────────────────────────────

const postUpload = multer({
    storage: multer.diskStorage({
        destination: path.join(__dirname, 'postUploads'),
        filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
    }),
});

app.post('/src/postUploads', postUpload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).send('No image file uploaded.');

    const { description, user_id } = req.body;
    const userId = req.session.userId || user_id;
    if (!userId) return res.status(400).send('User ID is required.');

    try {
        const result = await pool.query(
            'INSERT INTO public."posts" ("user_id", "image_path", "description", "created_at") VALUES ($1, $2, $3, NOW()) RETURNING *',
            [userId, req.file.filename, description],
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error uploading post:', err);
        res.status(500).send('Error uploading image');
    }
});

app.get('/posts', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.*, u.name AS username,
                   TO_CHAR(p.created_at, 'YYYY-MM-DD HH24:MI:SS') AS formatted_created_at
            FROM posts p
            JOIN "Users" u ON p.user_id = u.user_id
            ORDER BY p.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching posts:', err);
        res.status(500).send('Error fetching posts.');
    }
});

app.post('/comment', async (req, res) => {
    const { post_id, content, user_id } = req.body;
    const userId = req.session.userId || user_id;
    try {
        const result = await pool.query(
            'INSERT INTO "comments" ("post_id", "user_id", "content", "created_at") VALUES ($1, $2, $3, NOW()) RETURNING *',
            [post_id, userId, content],
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error posting comment:', err);
        res.status(500).send('Error posting comment');
    }
});

app.get('/comments/:postId', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT c.*, u.name AS username,
                   TO_CHAR(c.created_at, 'YYYY-MM-DD HH24:MI:SS') AS formatted_created_at
            FROM "comments" c
            JOIN "Users" u ON c.user_id = u.user_id
            WHERE c.post_id = $1
        `, [req.params.postId]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching comments:', err);
        res.status(500).send('Error fetching comments');
    }
});

// ─── OCR (handwritten Mongolian recognition via Python CRNN) ─────────────────

app.post('/api/upload-image-base64', (req, res) => {
    try {
        const base64Data = (req.body.imageData || '').replace(/^data:image\/\w+;base64,/, '');
        const tempImagePath = path.join(__dirname, 'uploads', `ocr-${Date.now()}.jpg`);

        fs.mkdirSync(path.dirname(tempImagePath), { recursive: true });
        fs.writeFileSync(tempImagePath, Buffer.from(base64Data, 'base64'));

        const pythonProcess = spawn('python', ['src/ocr.py', tempImagePath]);

        let ocrResults = '';
        pythonProcess.stdout.on('data', (data) => { ocrResults += data.toString(); });
        pythonProcess.stderr.on('data', (data) => console.error('OCR stderr:', data.toString()));

        pythonProcess.on('close', (code) => {
            fs.unlink(tempImagePath, () => {});
            if (code !== 0) return res.status(500).json({ error: 'Error processing image' });
            const lines = ocrResults.split('\n').filter((line) => line.trim() !== '');
            res.json(lines);
        });
    } catch (err) {
        console.error('Error uploading image:', err);
        res.status(500).json({ error: 'Error uploading image' });
    }
});

// ─── SPA fallback ────────────────────────────────────────────────────────────

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
