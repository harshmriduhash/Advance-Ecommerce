import dotenv from 'dotenv'
import cors from 'cors'
import app from './app.js'
import connectDb from './db/connectToMongodb.js'

dotenv.config({
    path: './.env'
})

app.get('/', (req, res) => {
    res.send("Server is running")
})

connectDb()
    .then(() => {
        app.listen(process.env.PORT || 3000, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        })
    })
    .catch((err) => {
        console.log("MongoDb connection failed", err)
    })