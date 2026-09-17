const express = require('express');
const { createAuthRouter } = require('../routes/auth');
const { createUsersRouter } = require('../routes/users');
const { createDailyTasksRouter } = require('../routes/dailyTasks');

function createApiRouter({ client, getSecretKey }) {
    const router = express.Router();

    router.use(createAuthRouter({ client, getSecretKey }));
    router.use(createUsersRouter({ client }).router);
    router.use(createDailyTasksRouter({ client }));

    return router;
}

module.exports = { createApiRouter };
