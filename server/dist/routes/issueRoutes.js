"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const issueController_1 = require("../controllers/issueController");
const router = (0, express_1.Router)();
router.get('/recommendations', issueController_1.getRecommendations);
router.post('/:id/bookmark', issueController_1.toggleBookmark);
exports.default = router;
