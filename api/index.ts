import express from "express"
import loaders from "@medusajs/medusa/loaders/index"
import { defineConfig } from "@medusajs/framework/utils"

let app: express.Express

const gcfModule = Object.values(require.cache).find(
  (mod: any) => mod.filename && mod.filename.endsWith("get-config-file.js"),
)
if (gcfModule) {
  gcfModule.exports.getConfigFile = async () => {
    const storeCors = process.env.STORE_CORS!
    const adminCors = process.env.ADMIN_CORS!
    const authCors = process.env.AUTH_CORS!
    const configModule = defineConfig({
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
    })
    configModule.plugins = []
    return {
      configModule,
      configFilePath: "inline",
      error: null,
    }
  }
}

async function bootstrap() {
  if (app) return app

  const serverApp = express()

  await loaders({
    directory: process.cwd(),
    expressApp: serverApp,
  })

  app = serverApp
  return app
}

export default async function handler(req: any, res: any) {
  try {
    const server = await bootstrap()
    return server(req, res)
  } catch (e: any) {
    console.error("Handler error:", e)
    res.status(500).json({
      error: true,
      message: e?.message,
      stack: e?.stack?.split("\n").slice(0, 10).join("\n"),
    })
  }
}
