import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions'
import { connectLambda } from '@netlify/blobs'
import serverless from 'serverless-http'
import { createApp } from '../../server/app.js'

let serverlessHandler: ReturnType<typeof serverless> | null = null

async function getServerlessHandler() {
  if (!serverlessHandler) {
    const app = await createApp('/data')
    serverlessHandler = serverless(app)
  }
  return serverlessHandler
}

function normalizePath(event: HandlerEvent) {
  const path = event.path.replace(/^\/\.netlify\/functions\/api/, '/api')
  return path || '/api/health'
}

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  connectLambda(event)

  const netlifyHandler = await getServerlessHandler()
  return netlifyHandler(
    {
      ...event,
      path: normalizePath(event),
    },
    context
  )
}
