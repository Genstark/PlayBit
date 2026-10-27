const express = require('express');
const { createAuthRouter } = require('../routes/auth');
const { createUsersRouter } = require('../routes/users');
const { createDailyTasksRouter } = require('../routes/dailyTasks');
const ELibraryRouter = require('../routes/e-library');

function createApiRouter({ client, getSecretKey }) {
    const router = express.Router();

    router.use(createAuthRouter({ client, getSecretKey }));
    router.use(createUsersRouter({ client }).router);
    router.use(createDailyTasksRouter({ client }));
    router.use(ELibraryRouter());
    return router;
}

module.exports = { createApiRouter };
