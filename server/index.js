const keys = require('./keys')

// express
const express = require('express')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(express.json())

// postgres
const { Pool } = require('pg')
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort
})

pgClient.on('error', () => console.log('lost PG connection'))

pgClient
  .query('CREATE TABLE IF NOT EXISTS values (number INT)')
  .catch(console.error)

// redis
const redis = require('redis')
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
})

const redisPublisher = redisClient.duplicate()

// routes
app.get('/', (req, res) => {
  res.send('hi')
})

app.get('/values/all', async (req, res) => {
  const values = await pgClient.query('SELECT * from values')
  res.send(values.rows)
})

app.get('/values/current', (req, res) => {
  redisClient.hgetall('values', (err, values) => {
    res.send(values)
  })
})

app.post('/values', async (req, res) => {
  const index = parseInt(req.body.index)
  if (index > 40)
    return res.status(422).send('Index too high')
  if (!Number.isInteger(index))
    return res.sendStatus(400)

  redisClient.hset('values', index, 'Nothing yet!')
  redisPublisher.publish('insert', index)
  await pgClient.query('INSERT INTO values(number) VALUES($1)', [index])

  res.send({working: true})
})

app.listen(5000, err => console.log('listening'))