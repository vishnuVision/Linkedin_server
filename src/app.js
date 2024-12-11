import express from 'express';
import cookieParser from 'cookie-parser';
import { configDotenv } from "dotenv";
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import { connectDB } from './config/db.js';
import cors from "cors";
import { v2 as cloudinary } from 'cloudinary';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { socketAuthenticator } from "./middlewares/Socketmiddleware.js"

const userSockets = new Map();

configDotenv({
    path:"./.env"
});

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());

app.use(cors({
    origin:"http://localhost:5173",
    credentials:true,
    methods:['GET','POST','PUT','DELETE']
}))

const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods:["GET","POST","PUT","DELETE"],
        credentials: true
    }
});

app.set("io",io);

// io.use((socket, next) => {
//     cookieParser()(socket.request, socket.request.res, async(err)=>{
//         await socketAuthenticator(err,socket,next);
//         next();
//     });
// });

// io.on("connection", (socket) => {
//     if(socket.user)
//     {
//         userSockets.set(socket.user._id.toString(),socket.id);
//     }

//     socket.on("LOGOUT",()=>{
//         if(socket.user)
//         {
//             userSockets.delete(socket.user._id.toString());
//         }
//     })

//     socket.on("disconnect", () => {
//         if(socket.user)
//         {
//             userSockets.delete(socket.user._id.toString());
//         }
//     });
// });

app.get("/",(req,res)=>{
    res.send("Hello World");
})

// app.use("/api/v1",router);

app.use(errorMiddleware);

connectDB()
.then(()=>{
    server.listen(process.env.PORT || 3000, () => {
        console.log(`Server is running on port ${process.env.PORT || 3000}`);
    });    
})
.catch((error)=>{
    throw error;
})


export default app;
export {
    userSockets
}