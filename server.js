const express = require('express')
const graphqlHTTP = require('express-graphql')
const { express: playground } = require('graphql-playground/middleware')
const schema = require('./schema')

const app = express()
app.use('/graphql', graphqlHTTP({ schema, graphiql: true }))
app.use('/playground', playground({ endpoint: '/graphql' }))
app.listen(3000)

console.log('Listening...')
