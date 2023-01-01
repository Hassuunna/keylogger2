import dotenv from "dotenv"
import express from "express"
import cors from 'cors'
import bodyParser from "body-parser"
import mysql from "mysql2/promise"
import fs from 'fs'
import 'log-timestamp'

dotenv.config();

// reject if people try

const connection = await mysql.createConnection({
    uri: process.env.DATABASE_URL
})

console.log("Database Connected");

const app = express();
const port = process.env.PORT || 8080;

app.use(bodyParser.json());

// We set the CORS origin to * so that we don't need to
// worry about the complexities of CORS. 
app.use(cors({
    "allowedHeaders": [
        'Origin', 'X-Requested-With',
        'Content-Type', 'Accept',
        'X-Access-Token', 'Authorization', 'Access-Control-Allow-Origin',
        'Access-Control-Allow-Headers',
        'Access-Control-Allow-Methods'
    ],
    "methods": 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
    "preflightContinue": true,
    "origin": '*',
}));



const logsFile = '../log.txt'

console.log(`Watching for file changes on ${logsFile}`)

fs.watchFile(logsFile, {
    // Passing the options parameter
    bigint: false,
    persistent: true,
    interval: 500,
}, (curr, prev) => {
    readChanges()
});

function readChanges() {
    try {
        const data = fs.readFileSync(logsFile, 'utf8')
        const logs = data.split("\r\n")
        let curr = updateRecorder(logs.length)
        //console.log(logs.length, curr)
        for (let i = curr; i < logs.length; i++)
            Update(logs[i])
    } catch (e) {
        console.log('Error:', e.stack)
    }
}

function updateRecorder(logsNo) {
    const curr = fs.readFileSync('recorder.txt', 'utf8').toString()
    fs.writeFileSync('recorder.txt', logsNo.toString())
    return parseInt(curr)
}
// Insert into databaseeee
async function Update(userQuery) {
    console.log('inserting new log', userQuery);
    const query = "INSERT INTO logs (`log`, `datetime`) VALUES (?, CURRENT_TIMESTAMP);"
    const [rows, fields] = await connection.execute(query, [userQuery]);
}

app.use("/logs", async (req, res) => {
    const query = `SELECT * FROM logs`
    //console.log(query);
    const [rows, fields] = await connection.execute(query);
    //console.log(rows)
    let arr = [];
    rows?.forEach(element => {
        //arr.push(String.fromCharCode(element.log.charCodeAt() - 2))
        arr.push(element.log)
    });
    res.json(arr)
});

// Root URI call
app.get("/", async (req, res) => {
    res.json({ msg: 'Hello World!' });
});

// Start the Server
app.listen(port, () => {
    console.log(`Backend server is listening on port ${port}....`);
    console.log(`press CTRL+C to stop server`);
});
