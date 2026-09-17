const express = require('express');
const { downloadData, downloadDataByDate } = require('../utils/uploadingData');

function convertTimeToSeconds(timeStr) {
    const [min, sec] = timeStr.split(':').map(Number);
    return min * 60 + sec;
}

function rankPlayers(players) {
    const updatedPlayers = players.map(player => ({
        ...player,
        totalInSeconds: convertTimeToSeconds(player.totalTime),
        totalScore: player.mcqScore + player.numberBowlingScore
    }));
    return [...updatedPlayers].sort((a, b) => b.totalScore - a.totalScore || a.totalInSeconds - b.totalInSeconds)
        .map((player, index) => ({ ...player, rank: index + 1 }));
}

function createUsersRouter({ client }) {
    const router = express.Router();
    const users = () => client.db('E-Learning').collection('users');
    const dailyTasks = () => client.db('E-Learning').collection('daily-tasks');

    router.get('/profile/:user', async (req, res) => {
        try {
            const userProfileData = await users().findOne({ name: req.params.user }, { projection: { _id: 0, password: 0 } });
            if (!userProfileData) {
                return res.status(404).json({ message: 'User not found', ok: false });
            }
            return res.status(200).json({ data: userProfileData, ok: true });
        } catch (error) {
            return res.status(500).json({ error: 'Internal server error', ok: false });
        }
    });

    router.get('/repeat-check/:user', async (req, res) => {
        try {
            const scoreboardData = await dailyTasks().find({ userName: req.params.user }).toArray();
            const checkTodayDate = new Date().toISOString().slice(0, 10);
            const findTodayEntry = scoreboardData.find(entry => entry.submissionDate === checkTodayDate);
            if (findTodayEntry) {
                return res.status(200).json({ message: 'player found', ok: true, user: req.user, data: scoreboardData });
            } else {
                return res.status(200).json({ message: 'player not found', ok: false });
            }
        } catch (error) {
            return res.status(500).json({ error: 'Internal server error', ok: false });
        }
    });

    router.get('/user-privious-score/:user/:date', async (req, res) => {
        try {
            const download = await downloadDataByDate('downLoadByDate', req.params.date);
            const score = download.data.find(entry => entry.userName === req.params.user);
            if (score) {
                return res.status(200).json({ message: 'got the username', ok: true, user: req.params.user, data: score });
            }
            return res.status(404).json({ message: 'Data not found', ok: false, user: req.params.user, data: false });
        } catch (error) {
            return res.status(500).json({ error: 'Internal server error', ok: false });
        }
    });

    router.get('/user-score/:user', async (req, res) => {
        try {
            const userScoreData = await dailyTasks().find({ userName: req.params.user }).toArray();
            if (!userScoreData.length) {
                const user = await users().findOne({ name: req.params.user }, { projection: { _id: 0, email: 1 } });
                if (!user) {
                    return res.status(404).json({ message: 'User not found', ok: false });
                }
                return res.status(200).json({ message: 'No today score found', ok: false, data: { email: user.email } });
            }
            const todayDate = new Date().toISOString().slice(0, 10);
            const todayScore = userScoreData.find(score => score.submissionDate === todayDate);
            if (todayScore) {
                return res.status(200).json({ data: todayScore, ok: true });
            } else {
                return res.status(200).json({ message: 'No score data for today', ok: false, data: { email: userScoreData[0].userEmail } });
            }
        } catch (error) {
            return res.status(500).json({ error: 'Internal server error', ok: false });
        }
    });

    router.get('/download-score', async (req, res) => {
        const upload = await downloadData('download');
        if (!upload || !upload.data) {
            return res.status(404).json({ message: 'No scoreboard data found', ok: false });
        }
        return res.status(200).json({ message: 'Uploaded to S3', ok: true, upload });
    });

    return { router, rankPlayers };
}

module.exports = { createUsersRouter, rankPlayers };
