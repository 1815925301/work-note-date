import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions'
import serverless from 'serverless-http'
import { createApp } from '../../server/app.js'

let handler: ReturnType<typeof serverless> | null = null

async function getHandler() {
  if (!handler) {
    const app = await createApp('/data')
    handler = serverless(app)
  }
  return handler
}

function normalizePath(event: HandlerEvent) {
  const path = event.path.replace(/^\/\.netlify\/functions\/api/, '/api')
  return path || '/api/health'
}

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const netlifyHandler = await getHandler()
  return netlifyHandler(
    {
      ...event,
      path: normalizePath(event),
    },
    context
  )
}
