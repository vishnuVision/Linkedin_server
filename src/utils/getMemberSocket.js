import { userSockets } from "../app.js"
import { ErrorHandler } from "./ErrorHandler.js";

const getMemberSocket = (members) => {
    if(members.length > 0)
    {
        return members.map(member => userSockets.get(member.toString()));
    }
    else
    {
        return [];
    }
}

const getOfflineMembers = (members) => {
    if(members.length > 0)
    {
        return members.filter(member => !userSockets.get(member.toString()));
    }
    else
    {
        return [];
    }
}


const emitEvent = (req , next , event , data , member) => {
    const io = req.app.get("io");
    const memberSockets = getMemberSocket(member);
    // if(event === "NEW_NOTIFICATION")
    // {
    //     const offlineMembers = getOfflineMembers(member);
    //     let notificationData;
    //     if(data?.text || data?.image)
    //     {
    //         notificationData = {text:data?.text,image:data?.image,owner:data?.owner,message:data?.message};
    //     }
    //     else
    //     {
    //         notificationData = {text:data?.title,image:data?.image || null,owner:data?.owner,message:data?.message};
    //     }

    //     offlineMembers.map(async(member) => {
    //         try {
    //             await Notification.create({...notificationData,show:false,receiver:member});
    //         } catch (error) {
    //             return next(new ErrorHandler(error.message || "An unexpected error occurred",404));
    //         }
            
    //     });
    // }
    io.to(memberSockets).emit(event , data);
}

const broadcastEvent = (req , next , event , data) => {
    const io = req.app.get("io");
    io.emit(event , data);
}

export {
    getMemberSocket,
    getOfflineMembers,
    emitEvent,
    broadcastEvent
}