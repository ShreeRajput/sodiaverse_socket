import { Server } from "socket.io"

const PORT = process.env.PORT || 8900; 
const io = new Server(PORT, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  },
});

console.log(`Socket.IO server is running on port ${PORT}`);

let usersIds = []

const checkIdAndAdd = (userId,socketId)=> {

    const existingUserIndex = usersIds.findIndex((user) => user.userId === userId)

    if (existingUserIndex === -1) {
        usersIds.push({ userId, socketId })
    } 
    else {
        usersIds[existingUserIndex].socketId = socketId
    }
}

const removeUserId = (socketId)=> {
    usersIds = usersIds.filter(ele => ele.socketId !== socketId)
}

const getSocketIdOfReceiver = (id)=> {
    const receiver = usersIds.find((ele) => ele.userId===id)
    return receiver?.socketId
}

io.on("connection", (socket) => {
 
  //take userId from user & store in array usersIds
  socket.on("addUser",({userId})=>{
        checkIdAndAdd(userId,socket.id)
        io.emit("getUsers",usersIds)
  })

  //get and send mesage
  socket.on("sendMessage",({senderId,receiverId,text})=> {
      const receiverSocketId = getSocketIdOfReceiver(receiverId)
      io.to(receiverSocketId).emit("receiveMessage",{senderId,text})
  })

  //disconnect socket
  socket.on("disconnect", () => {
        removeUserId(socket.id)
        io.emit("getUsers",usersIds)
  });
});
