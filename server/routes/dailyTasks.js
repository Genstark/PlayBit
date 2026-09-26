const express = require('express');
const { rollDice } = require('../utils/randomRollDice');
const googleAPI = require('../utils/googleAPI');
const { uploadData, downloadData } = require('../utils/uploadingData');
const { rankPlayers } = require('./users');

function createDailyTasksRouter({ client }) {
    const router = express.Router();
    let rolldicenumber = [];
    let questions = [];
    const dailyTasks = () => client.db('E-Learning').collection('daily-tasks');
    const taskData = () => client.db('E-Learning').collection('daily-task-data');
    const users = () => client.db('E-Learning').collection('users');

    router.get('/roll-dice', async (req, res) => {
        try {
            const today = new Date().toISOString().slice(0, 10);
            const todayDoc = (await taskData().find().toArray()).find(data => data.date === today);
            if (todayDoc) {
                rolldicenumber = todayDoc.rolldicenumber || [];
                questions = todayDoc.questions || [];
                return res.status(200).json({ result: rolldicenumber, questions, ok: true });
            }

            await taskData().deleteMany({});
            await dailyTasks().deleteMany({});
            rolldicenumber = await rollDice();
            questions = await googleAPI.generateText();
            while (questions.length < 10) {
                questions = await googleAPI.generateText();
            }
            await taskData().insertOne({ date: today, rolldicenumber, questions });
            return res.status(200).json({ result: rolldicenumber, questions, ok: true });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    });

    router.get('/daily-tasks/scoreboard', async (req, res) => {
        try {
            const getScore = await downloadData('download');
            const scoreboardData = getScore && getScore.data ? getScore.data : [];
            return res.status(200).json({ scoreData: rankPlayers(scoreboardData), ok: true });
        } catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    });

    router.post('/submit/daily-tasks', async (req, res) => {
        const response = req.body;
        const user = await users().findOne({ name: response.userName });
        if (!user) return res.status(400).json({ error: 'User not found', ok: false });
        response.userEmail = user.email;
        try {
            await dailyTasks().insertOne(response);
            const shortscoreData = rankPlayers(await dailyTasks().find().toArray());
            await uploadData(shortscoreData, 'upload');
            console.log('Daily tasks submitted successfully');
        } catch (error) {
            console.error('Error submitting daily tasks:', error);
        }
        return res.status(200).json({ message: 'Daily tasks submitted successfully', ok: true });
    });

    return router;
}

module.exports = { createDailyTasksRouter };
