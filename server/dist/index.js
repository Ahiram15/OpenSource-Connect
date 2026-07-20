"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./config/db");
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const issueRoutes_1 = __importDefault(require("./routes/issueRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'OpenSource Connect Backend API',
        timestamp: new Date().toISOString()
    });
});
// Register API Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/user', userRoutes_1.default);
app.use('/api/issues', issueRoutes_1.default);
// Start Server
app.listen(PORT, () => {
    console.log(`🚀 OpenSource Connect Server listening on http://localhost:${PORT}`);
    (0, db_1.connectDB)();
});
exports.default = app;
