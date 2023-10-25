import SideNavbar from "./SideNavbar";
import jwt_decode from "jwt-decode";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../Styles/Messages.css";
import Conversation from "../Components/Conversation";
import { format } from "timeago.js";
import { io } from "socket.io-client";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import Picker from "emoji-picker-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons";

const Messages = () => {
  const [usersData, setUsersData] = useState([]);
  const [user, setUser] = useState({});
  const [ConvId, setConvId] = useState("");
  const [currentUser, setCurrentUser] = useState({});
  // const [socket, setSocket] = useState(null);
  const socket = useRef();

  const [selectedImage, setSelectedImage] = useState(null);
  const [baseIm, setbaseIm] = useState(null);
  const [msg, setMsg] = useState([]);
  const [onlineUsers, setonlineUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [msgTxt, setMsgTxt] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [arrMsg, setArrMsg] = useState(null);
  const currentUserData = JSON.parse(localStorage.getItem("curUser"));
  const currentUserId = currentUserData._id;
  const scrollRef = useRef();
  const inputRef = useRef(null);
  const [imageSrc, setImageSrc] = useState();
  const [imgGet, setimgGet] = useState(false);

  console.log("check Img data", imageSrc);

  const fetchConversation = async () => {
    try {
      const token = localStorage.getItem("token");
      const decodedToken = jwt_decode(token);
      const response = await axios.get(
        `http://localhost:5000/api/conversation/${decodedToken.userId}`
      );
      if (response.status === 200) {
        setUsersData(response.data);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };
  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/Message/${ConvId}`
      );
      if (response.status === 200) {
        setMsg(response.data);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  console.log(usersData, "usseerrDaaaataaa");

  const fetchCurrentUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const decodedToken = jwt_decode(token);
      const response = await axios.get(
        `http://localhost:5000/api/auth/getCurrentUser/${decodedToken.userId}`
      );

      if (response.status === 200) {
        console.log("currentUser:", response.data);
        setCurrentUser(response.data);
      }
    } catch (error) {
      console.error("CurrentUserError:", error);
    }
  };
  const postMessage = async () => {
    const msgObj = {
      conversationId: ConvId,
      sender: currentUserId,
      text: msgTxt,
    };
    const receiverId = usersData
      .find((c) => c._id === ConvId)
      ?.members.find((c) => c !== currentUserId);
    console.log(receiverId, "Ris");

    socket.current?.emit("sendMessage", {
      senderId: currentUserId,
      receiverId: receiverId,
      text: msgTxt,
    });

    socket.current?.emit("setImage", {
      senderId: currentUserId,
      receiverId: receiverId,
      img: selectedImage,
    });
    setSelectedImage(null);
    setimgGet(!imgGet);

    try {
      const response = await axios.post(
        `http://localhost:5000/api/Message`,
        msgObj
      );

      if (response.status === 200) {
        setMsg([...msg, response.data]);
        setMsgTxt("");
        // socket.current.on("getMessage", (data) => {
        //   setArrMsg({
        //     sender: data.senderId,
        //     text: data.text,
        //     createdAt: Date.now(),
        //   });
        // });
        // socket.current?.on("getImage", (data) => {
        //   setArrMsg({
        //     sender: data.senderId,
        //     img: data.imgBase,
        //     text: "",
        //     createdAt: Date.now(),
        //   });
        // });
      }
    } catch (error) {
      console.error("CurrentUserError:", error);
    }
  };

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const decodedToken = jwt_decode(token);
      const frndId = usersData
        .find((c) => c._id === ConvId)
        .members.find((c) => c !== decodedToken.userId);

      const response = await axios.get(
        `http://localhost:5000/api/auth/getParticularUser/${frndId}`
      );

      if (response.status === 200) {
        setUser(response.data);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const onEmojiClick = (event) => {
    setMsgTxt((prevInput) => prevInput + event.emoji);
    setShowPicker(false);

    // Focus the input field after adding an emoji
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    socket.current?.on("getImage", (data) => {
      console.log(data, "getimg");
      setArrMsg({
        sender: data.senderId,
        img: data.imgBase,
        text: "",
        createdAt: Date.now(),
      });
    });
  }, [imgGet]);

  const handleTyping = () => {
    const receiverId = usersData
      .find((c) => c._id === ConvId)
      ?.members.find((c) => c !== currentUserId);

    socket.current?.emit("typing", {
      isType: true,
      receiverId: receiverId,
    });
    console.log(isTyping, "is");
    // Clear the typing indicator after a certain time (e.g., 3 seconds)
    setTimeout(() => {
      socket.current?.emit("typing", {
        isType: false,
        receiverId: receiverId,
      });
    }, 2000);
    socket.current?.on("getTyping", (typing) => {
      setIsTyping(typing.isType);
    });
  };

  useEffect(() => {
    socket.current?.emit("addUser", currentUserId);
    socket.current?.on("getUsers", (users) => {
      setonlineUsers(users);
    });
    socket.current?.on("getTyping", (typing) => {
      setIsTyping(typing.isType);
    });
  }, [currentUser]);

  console.log(onlineUsers, "onnuuu");
  useEffect(() => {
    fetchConversation();
    fetchCurrentUsers();
  }, []);

  useEffect(() => {
    socket.current = io("ws://localhost:8900");
    socket.current?.on("getMessage", (data) => {
      setArrMsg({
        sender: data.senderId,
        img: "",
        text: data.text,
        createdAt: Date.now(),
      });
    });
  }, []);
  socket.current?.on("getImage", (data) => {
    console.log(data.imgBase, "getImgData");
    // console.log(data.imgBase, "basimg");
    setArrMsg({
      sender: data.senderId,
      img: data.imgBase,
      text: "",
      createdAt: Date.now(),
    });
  });

  useEffect(() => {
    arrMsg &&
      usersData
        ?.find((c) => c._id === ConvId)
        ?.members?.includes(arrMsg.sender) &&
      (arrMsg.img !== undefined || arrMsg.text !== "") &&
      (arrMsg.img !== "" || arrMsg.text !== "") &&
      setMsg((prev) => [...prev, arrMsg]);
  }, [arrMsg, usersData]);

  // useEffect(() => {
  //   arrMsg &&
  //     usersData
  //       ?.find((c) => c._id === ConvId)
  //       ?.members?.includes(arrMsg.sender) &&
  //     setMsg((prev) => [...prev, arrMsg]);
  // }, [baseIm, usersData]);

  useEffect(() => {
    fetchMessages();
    fetchUser();
  }, [ConvId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msg]);

  // useEffect(() => {
  //   const receiverId = usersData
  //     .find((c) => c._id === ConvId)
  //     ?.members.find((c) => c !== currentUserId);

  //   socket.current?.emit("setImage", {
  //     senderId: currentUserId,
  //     receiverId: receiverId,
  //     img: selectedImage,
  //   });
  //   socket.current?.on("getImage", (data) => {
  //     setArrMsg({
  //       sender: data.senderId,
  //       img: data.imgBase,
  //       text: "",
  //       createdAt: Date.now(),
  //     });
  //   });
  // }, [selectedImage]);

  console.log(baseIm, "base");
  console.log(isTyping, "isTyping");
  console.log(onlineUsers, "onlineusiD");
  console.log(arrMsg, "arrMsg");
  console.log(msg, "msg");
  console.log(user, "user");
  console.log(selectedImage, "selected");
  console.log(ConvId, "convers");
  console.log(baseIm, "baseIm");
  console.log(
    usersData
      .filter((u) => u._id === ConvId)[0]
      ?.members?.includes(currentUserId),
    "ty"
  );

  return (
    <>
      <div style={{ display: "flex", gap: "100px" }}>
        <div>
          <SideNavbar />
        </div>
        <div style={{ display: "flex" }}>
          <div className="messages-container">
            <h4 className="messages-title">Message Your Friends</h4>
            {usersData?.map((u) => (
              <div
                onClick={() => {
                  setConvId(u._id);
                  // localStorage.removeItem("notifications");
                }}
              >
                <Conversation
                  conversation={u}
                  currentUser={currentUserId}
                  onlineUsers={onlineUsers}
                />
              </div>
            ))}
            <br />
          </div>
          {ConvId !== "" && (
            <div className="chat-container" ref={scrollRef}>
              <div className="chat-header">
                <img
                  src={
                    localStorage.getItem(`profileImg_${user.lastName}`) ||
                    "https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png?f=webp"
                  }
                  alt="User Profile"
                  className="user-profile"
                />
                <span className="user-name">
                  {user.firstName} {user.lastName}
                </span>
              </div>
              <div className="chat-messages">
                {msg.length > 0 ? (
                  msg?.map((messg) => {
                    return (
                      <>
                        <div
                          className={
                            messg.sender === currentUserId
                              ? `message sent`
                              : `message received`
                          }
                        >
                          {messg.sender !== currentUserId && (
                            <img
                              src={
                                // localStorage.getItem(
                                //   `profileImage_${user.lastName}`
                                // ) ||
                                "https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png?f=webp"
                              }
                              alt="User Profile"
                              className="user-profile"
                            />
                          )}
                          {messg.text !== "" && (
                            <div className="message-content">
                              <span
                                className="message-text"
                                style={{
                                  backgroundColor:
                                    messg.sender === currentUserId && "#c98b8b",
                                }}
                              >
                                {messg.text}
                              </span>
                              <span className="message-time">
                                {format(messg.createdAt)}
                              </span>
                            </div>
                          )}
                          {messg.text === "" && (
                            <div className="message-content">
                              <div className="message-content">
                                <img
                                  src={`data:image/png;base64,${messg.img}`}
                                  height="80px"
                                  width="80px"
                                />
                              </div>
                              <span className="message-time">
                                {format(messg.createdAt)}
                              </span>
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })
                ) : (
                  <>
                    <div className="chat-messages">
                      <div className="message received">
                        <div className="message-content">
                          Start Conversation
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              {/* {baseIm && (
                <div className="message-content">
                  <img
                    src={`data:image/png;base64,${baseIm}`}
                    height="80px"
                    width="80px"
                  />
                </div>
              )} */}
              <div className="chat-input">
                <button
                  onClick={() => setShowPicker((val) => !val)}
                  style={{ fontSize: "19px" }}
                >
                  🤩
                </button>
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={msgTxt}
                  onChange={(e) => setMsgTxt(e.target.value)}
                  onKeyPress={handleTyping}
                  ref={inputRef}
                  className="message-input"
                />
                <label htmlFor="image-upload">
                  <FontAwesomeIcon icon={faPaperclip} className="icon" />
                </label>
                <input
                  id="image-upload"
                  type="file"
                  name="myImage"
                  style={{ display: "none" }}
                  onChange={(event) => {
                    console.log(event.target.files[0]);
                    setSelectedImage(event.target.files[0]);
                  }}
                />

                <button onClick={postMessage} style={{ fontSize: "17px" }}>
                  <FontAwesomeIcon
                    icon={faPaperPlane}
                    style={{ color: "brown" }}
                  />
                </button>
              </div>
              {showPicker && (
                <div style={{ height: "200px", width: "350px" }}>
                  <Picker
                    pickerStyle={{ width: "100%" }}
                    onEmojiClick={onEmojiClick}
                  />
                </div>
              )}
              {usersData
                ?.find((c) => c._id === ConvId)
                ?.members?.includes(arrMsg?.sender) &&
                isTyping && <span>Typing...</span>}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Messages;
