import { v4 as uuidv4 } from 'uuid';

function handelStart(roomArr, socket, cb, io) {
  // Check available rooms
  let availableroom = checkAvailableRoom();
  if (availableroom.is) {
    socket.join(availableroom.roomid);
    cb('p2');
    closeRoom(availableroom.roomid);
    if (availableroom?.room) {
      io.to(availableroom.room.p1.id).emit('remote-socket', socket.id);
      socket.emit('remote-socket', availableroom.room.p1.id);
      socket.emit('roomid', availableroom.room.roomid);
    }
  }
  // If no available room, create one
  else {
    let roomid = uuidv4();
    socket.join(roomid);
    roomArr.push({
      roomid,
      isAvailable: true,
      p1: { id: socket.id },
      p2: { id: null }
    });
    cb('p1');
    socket.emit('roomid', roomid);
  }

  /**
   * @desc Search through roomArr and make isAvailable false, also set p2.id to socket.id
   */
  function closeRoom(roomid) {
    for (let i = 0; i < roomArr.length; i++) {
      if (roomArr[i].roomid == roomid) {
        roomArr[i].isAvailable = false;
        roomArr[i].p2.id = socket.id;
        break;
      }
    }
  }

  /**
   * @returns Object {is, roomid, room}
   * is -> true if room is available
   * roomid -> id of the room, could be empty
   * room -> the roomArray, could be empty 
   */
  function checkAvailableRoom() {
    for (let i = 0; i < roomArr.length; i++) {
      if (roomArr[i].isAvailable) {
        return { is: true, roomid: roomArr[i].roomid, room: roomArr[i] };
      }
      if (roomArr[i].p1.id == socket.id || roomArr[i].p2.id == socket.id) {
        return { is: false, roomid: "", room: null };
      }
    }
    return { is: false, roomid: '', room: null };
  }
}

/**
 * @desc Handles disconnection event
 */
function handelDisconnect(disconnectedId, roomArr, io) {
  for (let i = 0; i < roomArr.length; i++) {
    if (roomArr[i].p1.id == disconnectedId) {
      if (roomArr[i].p2.id) {
        io.to(roomArr[i].p2.id).emit("disconnected"); // Notify the other user
        roomArr[i].isAvailable = true;
        roomArr[i].p1.id = roomArr[i].p2.id;
        roomArr[i].p2.id = null;
      } else {
        roomArr.splice(i, 1);
      }
    } else if (roomArr[i].p2.id == disconnectedId) {
      if (roomArr[i].p1.id) {
        io.to(roomArr[i].p1.id).emit("disconnected"); // Notify the other user
        roomArr[i].isAvailable = true;
        roomArr[i].p2.id = null;
      } else {
        roomArr.splice(i, 1);
      }
    }
  }
}

/**
 * @desc Get type of person (p1 or p2)
 */
function getType(id, roomArr) {
  for (let i = 0; i < roomArr.length; i++) {
    if (roomArr[i].p1.id == id) {
      return { type: 'p1', p2id: roomArr[i].p2.id };
    } else if (roomArr[i].p2.id == id) {
      return { type: 'p2', p1id: roomArr[i].p1.id };
    }
  }
  return false;
}

// Export functions
export { handelStart, handelDisconnect, getType };
