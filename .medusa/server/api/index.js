"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const express_1 = __importDefault(require("express"));
const index_1 = __importDefault(require("@medusajs/medusa/loaders/index"));
const utils_1 = require("@medusajs/framework/utils");
let app;
const gcfModule = Object.values(require.cache).find((mod) => mod.filename && mod.filename.endsWith("get-config-file.js"));
if (gcfModule) {
    gcfModule.exports.getConfigFile = async () => {
        const storeCors = process.env.STORE_CORS;
        const adminCors = process.env.ADMIN_CORS;
        const authCors = process.env.AUTH_CORS;
        const configModule = (0, utils_1.defineConfig)({
            projectConfig: {
                databaseUrl: process.env.DATABASE_URL,
                redisUrl: process.env.REDIS_URL,
                http: {
                    storeCors,
                    adminCors,
                    authCors,
                    jwtSecret: process.env.JWT_SECRET || "supersecret",
                    cookieSecret: process.env.COOKIE_SECRET || "supersecret",
                },
                databaseDriverOptions: {},
            },
            modules: [
                {
                    resolve: "@medusajs/medusa/payment",
                    options: {
                        providers: [
                            {
                                resolve: "@medusajs/medusa/payment-stripe",
                                id: "stripe",
                                options: { apiKey: process.env.STRIPE_API_KEY },
                            },
                        ],
                    },
                },
                {
                    resolve: "@medusajs/medusa/caching",
                    options: {
                        providers: [
                            {
                                resolve: "@medusajs/medusa/caching-redis",
                                id: "cache-redis",
                                is_default: true,
                                options: { redisUrl: process.env.REDIS_URL },
                            },
                        ],
                    },
                },
                {
                    resolve: "@medusajs/medusa/event-bus-redis",
                    options: { redisUrl: process.env.REDIS_URL },
                },
                {
                    resolve: "@medusajs/medusa/workflow-engine-redis",
                    options: { redis: { url: process.env.REDIS_URL } },
                },
            ],
        });
        configModule.plugins = [];
        return {
            configModule,
            configFilePath: "inline",
            error: null,
        };
    };
}
async function bootstrap() {
    if (app)
        return app;
    const serverApp = (0, express_1.default)();
    await (0, index_1.default)({
        directory: process.cwd(),
        expressApp: serverApp,
    });
    app = serverApp;
    return app;
}
async function handler(req, res) {
    try {
        const server = await bootstrap();
        return server(req, res);
    }
    catch (e) {
        console.error("Handler error:", e);
        res.status(500).json({
            error: true,
            message: e?.message,
            stack: e?.stack?.split("\n").slice(0, 10).join("\n"),
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9hcGkvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFzRkEsMEJBWUM7QUFsR0Qsc0RBQTZCO0FBQzdCLDJFQUFvRDtBQUNwRCxxREFBd0Q7QUFFeEQsSUFBSSxHQUFvQixDQUFBO0FBRXhCLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FDakQsQ0FBQyxHQUFRLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQUMsQ0FDMUUsQ0FBQTtBQUNELElBQUksU0FBUyxFQUFFLENBQUM7SUFDZCxTQUFTLENBQUMsT0FBTyxDQUFDLGFBQWEsR0FBRyxLQUFLLElBQUksRUFBRTtRQUMzQyxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQTtRQUN6QyxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQTtRQUN6QyxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVUsQ0FBQTtRQUN2QyxNQUFNLFlBQVksR0FBRyxJQUFBLG9CQUFZLEVBQUM7WUFDaEMsYUFBYSxFQUFFO2dCQUNiLFdBQVcsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVk7Z0JBQ3JDLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVM7Z0JBQy9CLElBQUksRUFBRTtvQkFDSixTQUFTO29CQUNULFNBQVM7b0JBQ1QsUUFBUTtvQkFDUixTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLElBQUksYUFBYTtvQkFDbEQsWUFBWSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxJQUFJLGFBQWE7aUJBQ3pEO2dCQUNELHFCQUFxQixFQUFF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