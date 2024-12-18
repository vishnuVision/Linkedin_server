import { Router } from "express";
import { acceptFriendRequest, getListOfFriendRequest, ignoreFriendRequest, sendFriendRequest } from "../../controllers/sendRequest/sendFriendReuest.controller.js";

const friendRequestRouter = Router();

friendRequestRouter.post("/send/:userId",sendFriendRequest);
friendRequestRouter.put("/accept/:requestId",acceptFriendRequest);
friendRequestRouter.put("/ignore/:requestId",ignoreFriendRequest);
friendRequestRouter.get("/",getListOfFriendRequest);

export default friendRequestRouter;