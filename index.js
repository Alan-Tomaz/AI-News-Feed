import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import newsRoutes from './routes/news.js';

/* CONFIG */
const app = express();
/* USE ENV FILES */
dotenv.config();
/* USE JSON REQUESTS */
app.use(express.json());
/* CORS RULES */
app.use(cors({
    origin: '*', // Allow All Origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed Methods
}));
app.options('*', cors()); // Response all OPTIONS Requests

/* ROUTES */
app.get("/", (req, res) => res.status(200).json({ status: 200, msg: "Hello World!" }));
app.post("/", (req, res) => res.status(200).json({ status: 200, msg: "Hello World!" }));
app.use('/news', newsRoutes);

/* MONGOOSE SETUP */
/* Server PORT */
const port = process.env.PORT || 3000;
/* CONNECT DATABASE */
mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log("Database Connected");
        app.listen(port, () => {
            console.log(`App is Running in port ${port}`)
        })
    }).catch((err) => {
        console.log(err)
    })

/* VERCEL SERVER START */
/* export default app;
console.log(`App Started`);   */