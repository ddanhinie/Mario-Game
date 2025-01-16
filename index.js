const express = require('express')
const app = express()

app.use(express.static('public'))

const server= app.listen(8000, () => {
    const port = server.address().port
    console.log(`App started at http://localhost:${port}`)
})