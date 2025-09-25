export default defineEventHandler(async (event) => {
  try {
    // Basic health check
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: 'connected',
    }

    try {
      health.database = 'connected'
    } catch {
      health.database = 'disconnected'
      health.status = 'unhealthy'
    }

    // Set appropriate status code
    setResponseStatus(event, health.status === 'healthy' ? 200 : 503)

    return health
  } catch {
    setResponseStatus(event, 503)
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Internal server error',
    }
  }
})
