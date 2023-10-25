import { useEffect, useState } from "react";
import "../Styles/Notification.css";
import axios from "axios";
const Conversation = ({ conversation, currentUser, onlineUsers }) => {
  const [converUser, setconverUser] = useState({});
  const onArrUser = onlineUsers.filter((ou) => ou.userId !== currentUser);
  let online;

  console.log(onArrUser, "onlyyyyn");

  const fetchUsers = async () => {
    try {
      const frndId = conversation?.members?.find((c) => c !== currentUser);

      const response = await axios.get(
        `http://localhost:5000/api/auth/getParticularUser/${frndId}`
      );

      if (response.status === 200) {
        setconverUser(response.data);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);
  // console.log(convUser, "conVuser");
  return (
    <>
      {[converUser]?.map((us) => {
        return (
          <>
            <div className="message-card">
              <img
                src={
                  localStorage.getItem(`profileImg_${us.lastName}`) ||
                  "https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png?f=webp"
                }
                alt="Profile"
                className="noti-profile-image"
              />
              <span className="user-name">
                {us.firstName} {us.lastName}
              </span>
              {onArrUser.forEach((user) => {
                user?.userId === us._id
                  ? (online = "Online")
                  : (online = "Offline");
              })}

              <span className="message-snippet">
                {online === "Online" && (
                  <span className="online-user-circle">O</span>
                )}
              </span>
              <span className="message-time"> </span>
            </div>
          </>
        );
      })}
    </>
  );
};

export default Conversation;
