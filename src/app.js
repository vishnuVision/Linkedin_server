import express from 'express';
import cookieParser from 'cookie-parser';
import { configDotenv } from "dotenv";
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import { connectDB } from './config/db.js';
import cors from "cors";
import { v2 as cloudinary } from 'cloudinary';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { socketAuthenticator } from "./middlewares/Socketmiddleware.js";
import router from './routes/index.js';
import cron from "node-cron";
import { Experience } from './models/user/experience.model.js';
import { User } from './models/user/user.model.js';
import { Catchup } from './models/notification/catchup.model.js';
import { emitEvent } from './utils/getMemberSocket.js';
import { NEW_CATCH_UP } from './utils/events.js';

const userSockets = new Map();

configDotenv({
    path: "./.env"
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
    origin: "http://localhost:5173",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}))

const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});

app.set("io", io);

io.use((socket, next) => {
    cookieParser()(socket.request, socket.request.res, async (err) => {
        await socketAuthenticator(err, socket, next);
        next();
    });
});

io.on("connection", (socket) => {
    console.log(socket.id);

    if (socket.user) {
        console.log(socket.user);
        userSockets.set(socket.user.id.toString(),socket.id);
    }

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
});

cron.schedule("0 3 * * *", async (req, res, next) => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const year = new Date().getFullYear();

    try {

        // birthday catch up
        const usersWithBirthdayToday = await User.find({
            $expr: {
                $and: [
                    { $eq: [{ $month: "$birthday" }, month] },
                    { $eq: [{ $dayOfMonth: "$birthday" }, day] },
                ],
            },
        });

        if (usersWithBirthdayToday.length > 0) {
            const userIds = usersWithBirthdayToday.map(user => { return { userId: user._id.toString(), followers: user.followers, following: user.following } });
            const catchup = await Promise.all(userIds.map(async ({ userId, followers, following }) => {
                await Catchup.create({ owner: userId, type: "birthday" });
                emitEvent(req, next, NEW_CATCH_UP, null, [...followers, ...following])
            }
            ));
        }

        // work anniversaries catch up
        const usersWithWorkAnniversaryToday = await Experience.find({
            $expr: {
                $and: [
                    { $eq: [{ $month: "$startYear" }, month] },
                    { $eq: [{ $dayOfMonth: "$startYear" }, day] },
                ],
            },
            isPresent: true
        }).lean();

        if (usersWithWorkAnniversaryToday.length > 0) {
            const usersWithExperienceYears = usersWithWorkAnniversaryToday.map(user => {
                const date = new Date(user.startYear);
                const startedyear = date.getFullYear();

                if (startedyear !== year) {
                    const yearsOfExperience = year - startedyear;
                    return { ...user, yearsOfExperience };
                }
            });

            if (usersWithExperienceYears.length > 0) {
                const userIds = usersWithExperienceYears.map(({ _id, employee, yearsOfExperience, followers, following }) => { return { _id, yearsOfExperience, employee, followers, following } });

                if (userIds.length > 0) {
                    const catchup = await Promise.all(userIds.map(async ({ _id, yearsOfExperience, employee, followers, following }) => {
                        await Catchup.create({ owner: employee, type: "work anniversaries", yearsOfExperience, referenceId: _id })
                        emitEvent(req, next, NEW_CATCH_UP, null, [...followers, ...following])
                    }
                    ));
                }
            }
        }

    } catch (error) {
        throw error;
    }
});

app.get("/", (req, res) => {
    res.send("Hello World");
})

app.use("/api/v1", router);

app.use(errorMiddleware);

connectDB()
    .then(() => {
        server.listen(process.env.PORT || 3000, () => {
            console.log(`Server is running on port ${process.env.PORT || 3000}`);
        });
    })
    .catch((error) => {
        throw error;
    })


export default app;
export {
    userSockets
}