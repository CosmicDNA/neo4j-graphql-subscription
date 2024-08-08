import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { Neo4jGraphQL } from '@neo4j/graphql'
import bodyParser from 'body-parser'
import cors from 'cors'
import { config } from 'dotenv'
import express from 'express'
import { readFileSync } from 'fs'
import { useServer } from 'graphql-ws/lib/use/ws'
import { createServer } from 'http'
import { decode } from 'next-auth/jwt'
import { join } from 'path'
import { WebSocketServer } from 'ws'

import getFileProperties from './libs/file-properties.js'
import driver from './libs/neo4j.js'

config()

const { dirName } = getFileProperties(import.meta.url)
const schemaTypeDefs = readFileSync(join(dirName, 'libs', 'graphql', 'schema.graphql'), 'utf-8').toString()

const neoSchema = new Neo4jGraphQL({
  typeDefs: [
    schemaTypeDefs
  ],
  introspection: true,
  driver,
  features: {
    authorization: {
      key: process.env.NEXTAUTH_SECRET
    },
    subscriptions: true
  }
})

const schema = await neoSchema.getSchema()

await neoSchema.assertIndexesAndConstraints({ options: { create: true } })

const graphqlServerConfig = {
  path: {
    endpoint: '/api/graphql/endpoint',
    subscriptions: '/api/graphql/endpoint'
  },
  port: 4000
}

// Apollo server setup with WebSockets
const app = express()
const httpServer = createServer(app)
const wsServer = new WebSocketServer({
  server: httpServer,
  path: graphqlServerConfig.path.subscriptions
})

// Hand in the schema we just created and have the WebSocketServer start listening.
const serverCleanup = useServer({
  schema,
  context: (ctx) => {
    return ctx
  }
}, wsServer)

const server = new ApolloServer({
  schema,
  plugins: [
    // Proper shutdown for the HTTP server.
    ApolloServerPluginDrainHttpServer({ httpServer }),

    // Proper shutdown for the WebSocket server.
    {
      async serverWillStart () {
        return Promise.resolve({
          async drainServer () {
            await serverCleanup.dispose()
          }
        })
      }
    }
  ]
})

await server.start()

const bearerTokenPattern = /^Bearer [A-Za-z0-9-_=]+.[A-Za-z0-9-_=]+.?[A-Za-z0-9-_.+/=]*$/

const context = async ({ req }) => {
  if (req.headers.authorization) {
    if (bearerTokenPattern.test(req.headers.authorization)) {
      const token = req.headers.authorization.split(' ')[1]
      const secret = process.env.NEXTAUTH_SECRET
      try {
        const jwt = await decode({ token, secret })
        return {
          jwt
        }
      } catch (error) {
        console.log(error)
        return {}
      }
    } else {
      console.log('Invalid Bearer token format!')
    }
  }
  console.log('No authorization headers found...')
  return {}
}

app.use(
  graphqlServerConfig.path.endpoint,
  cors(),
  bodyParser.json(),
  expressMiddleware(server, {
    context
  })
)

const PORT = graphqlServerConfig.port
httpServer.listen(PORT, () => {
  console.log(
    [
      'Server is now running on:',
      ` - endpoint:\thttp://localhost:${PORT}${graphqlServerConfig.path.endpoint}`,
      ` - websocket:\tws://localhost:${PORT}${graphqlServerConfig.path.subscriptions}`
    ].join('\n'))
})
