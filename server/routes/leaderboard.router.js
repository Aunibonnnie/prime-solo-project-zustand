const express = require('express');
const pool = require('../modules/pool');
const router = express.Router();

// Get top 5 leaderboard scores (both user and guest users)
router.get('/', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT 
          COALESCE(u.username, g.username) AS username,
          SUM(gs.points) AS color_score
        FROM 
          game_score gs
        LEFT JOIN 
          "user" u ON gs.user_id = u.id
        LEFT JOIN 
          "guest_user" g ON gs.guest_user_id = g.id
        WHERE 
          gs.game_type = 'color'  
          AND gs.score_visible = TRUE
        GROUP BY 
          COALESCE(u.username, g.username)
        ORDER BY 
          color_score DESC
        LIMIT 5;
      `);
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ error: 'Failed to fetch leaderboard data' });
    }
  });
  
  router.post('/update-score', async (req, res) => {
    const { userId, points } = req.body;

    try {
        // Insert or update score for the user
        await pool.query(
            `
            INSERT INTO game_score (user_id, points, game_type, score_visible)
            VALUES ($1, $2, 'color', TRUE)
            ON CONFLICT (user_id, game_type) 
            DO UPDATE SET points = game_score.points + $2;
            `,
            [userId, points]
        );

        res.status(200).json({ message: 'Score updated successfully' });
    } catch (error) {
        console.error('Error updating score:', error);
        res.status(500).json({ error: 'Failed to update score' });
    }
});

  module.exports = router;
