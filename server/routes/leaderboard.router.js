const express = require('express');
const pool = require('../modules/pool'); // Ensure correct path
const router = express.Router();

// **Update Score**
router.post('/update-score', async (req, res) => {
    const { user_id, game_type, points } = req.body;

    if (!user_id || !game_type || typeof points !== 'number' || points <= 0) {
        return res.status(400).json({ success: false, error: 'Invalid input' });
    }

    try {
        await pool.query(
            `INSERT INTO game_score (user_id, game_type, points) 
             VALUES ($1, $2, $3) 
             ON CONFLICT (user_id, game_type) 
             DO UPDATE SET points = game_score.points + EXCLUDED.points`,
            [user_id, game_type, points]
        );

        res.json({ success: true, message: 'Score updated' });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

// **Fetch Scores for Leaderboard**
router.get('/scores', async (req, res) => {
    try {
        const { game_type } = req.query;

        if (!game_type || !['color', 'shape'].includes(game_type)) {
            return res.status(400).json({ success: false, error: 'Invalid game type' });
        }

        const query = `
            SELECT u.username, SUM(gs.points) AS ${game_type}_score
            FROM game_score gs
            JOIN "user" u ON gs.user_id = u.id
            WHERE gs.game_type = $1
            AND gs.score_visible = TRUE
            GROUP BY u.username
            ORDER BY ${game_type}_score DESC
            LIMIT 5;
        `;

        const result = await pool.query(query, [game_type]);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching leaderboard scores:', error);
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

// **Submit Score**
router.post('/submit', async (req, res) => {
    const { username, points, game_type } = req.body;

    try {
        await pool.query(
            `INSERT INTO game_score (user_id, points, game_type, score_visible) 
             VALUES ((SELECT id FROM "user" WHERE username = $1), $2, $3, TRUE)`,
            [username, points, game_type]
        );

        res.json({ success: true, message: 'Score submitted successfully' });
    } catch (error) {
        console.error('Error inserting score:', error);
        res.status(500).json({ success: false, message: 'Failed to submit score' });
    }
});

// **Reset Score**
router.post('/reset-score', async (req, res) => {
    const { user_id, game_type } = req.body;

    if (!user_id || !game_type) {
        return res.status(400).json({ success: false, error: 'Invalid input' });
    }

    try {
        await pool.query(
            `UPDATE game_score SET points = 0 WHERE user_id = $1 AND game_type = $2`,
            [user_id, game_type]
        );

        res.json({ success: true, message: 'Score reset successfully' });
    } catch (error) {
        console.error('Error resetting score:', error);
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

// **Fetch User Scores for Account Page**
router.get('/user-scores/:user_id', async (req, res) => {
    const { user_id } = req.params;

    try {
        const query = `
            SELECT 
                SUM(CASE WHEN game_type = 'color' THEN points ELSE 0 END) AS color_score,
                SUM(CASE WHEN game_type = 'shape' THEN points ELSE 0 END) AS shape_score
            FROM game_score 
            WHERE user_id = $1 AND score_visible = TRUE
            GROUP BY user_id;
        `;

        const result = await pool.query(query, [user_id]);

        if (result.rows.length === 0) {
            return res.json({ success: true, data: { color_score: 0, shape_score: 0 } });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error fetching user scores:', error);
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

// Backend delete route
router.delete("/delete-score/:user_id/:gameType", async (req, res) => {
    const { user_id, gameType } = req.params;
    console.log("DELETE request received:", req.params);
    console.log("Received delete request for:", user_id, gameType);

    if (gameType !== "color" && gameType !== "shape") {
        return res.status(400).json({ error: "Invalid score type" });
    }

    const client = await pool.connect(); // Get a client from the pool
    try {
        // Start the transaction
        await client.query("BEGIN");

        // First, delete the score for the specified game type
        const deleteRes = await client.query(
            `DELETE FROM game_score WHERE user_id = $1 AND game_type = $2`,
            [user_id, gameType]
        );
        
        if (deleteRes.rowCount === 0) {
            console.log(`No rows deleted for user ${user_id} and game type ${gameType}`);
            return res.status(404).json({ error: `No score found for user ${user_id} and game type ${gameType}` });
        }

        // Optionally, update visibility flag if you want to "hide" the score first
        await client.query(
            `UPDATE game_score SET score_visible = FALSE WHERE user_id = $1 AND game_type = $2`,
            [user_id, gameType]
        );

        // Commit the transaction
        await client.query("COMMIT");

        res.json({ message: `Deleted ${gameType} score for user ${user_id}` });
    } catch (error) {
        // If any query fails, roll back the transaction
        await client.query("ROLLBACK");
        console.error("Error deleting score:", error);
        res.status(500).json({ error: "Failed to delete score. Database error." });
    } finally {
        // Release the client back to the pool
        client.release();
    }
});







module.exports = router;



//create a usestate hook when choosing the game
//create a POST Route when the game is finished (button "End Game" updates the user score to the leadorboaord with user_id) (points)
//GET Call leadorboard component needs to get all the scores from the database 
//DELETE button for leadorboard 
