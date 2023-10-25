import { useState, useEffect } from "react";
import axios from "axios";
import SideNavbar from "./SideNavbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPlus,
  faCheck,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import "../Styles/Notification.css";
import jwt_decode from "jwt-decode";

const Notification = () => {
  const [usersData, setUsersData] = useState([]);
  const [user, setUser] = useState({});
  const [notifData, setNotifData] = useState([]);
  const [sendRequestUserData, setRequestUserData] = useState([]);
  const [currentUser, setCurrentUser] = useState({});
  const [sentFriendRequests, setSentFriendRequests] = useState([]);
  const [toggleVal, setToggleVal] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/auth/getUsers"
      );

      if (response.status === 200) {
        const UserData = response.data;
        console.log(UserData, "uuss");
        setUsersData(UserData);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };
  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/auth/getNotifications"
      );

      if (response.status === 200) {
        setNotifData(response.data);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };
  const fetchSenfFrUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const decodedToken = jwt_decode(token);
      const response = await axios.get(
        `http://localhost:5000/api/auth/getSendfrUser/${decodedToken.userId}`
      );

      if (response.status === 200) {
        setRequestUserData(response.data);
      }
    } catch (error) {
      console.error("Send Fr error", error);
    }
  };
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
      console.error("CurrentUser Error:", error);
    }
  };

  const sendFriendRequest = async (userId) => {
    try {
      const userData = {
        fName: user.firstName,
        lName: user.lastName,
        iD: currentUser._id,
      };
      const response = await axios.post(
        `http://localhost:5000/api/auth/sendFriendRequest/${userId}`,
        { userData }
      );
      if (response.status === 200) {
        console.log("Friend request sent:", response.data.message);
        setSentFriendRequests([...sentFriendRequests, userId]);
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
      // Handle errors here
    }
  };

  const sendFriendList = async (fname, lname, id) => {
    try {
      const userData = { fName: fname, lName: lname, iD: id };
      const response = await axios.post(
        `http://localhost:5000/api/auth/sendFriendList/${currentUser._id}`,
        { userData }
      );
      if (response.status === 200) {
        console.log("Friend list sent:", response.data);
        fetchUsers();
        fetchNotifications();
        fetchSenfFrUsers();
        setToggleVal((prev) => !prev);
        localStorage.setItem("isNotify", false);
        localStorage.setItem("sfpost", false);
      }
    } catch (error) {
      console.error("Error sending friend list:", error);
      // Handle errors here
    }
  };
  const rejectFriendList = async (iD) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/auth/rejectFriendList/${iD}`
      );
      if (response.status === 200) {
        console.log("reject Friend :", response.data);
        fetchUsers();
        fetchNotifications();
        fetchSenfFrUsers();
        localStorage.setItem("isNotify", false);
        setToggleVal((prev) => !prev);
      }
    } catch (error) {
      console.error("reject Friend:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwt_decode(token);
      setUser(decodedToken);
    }
    fetchCurrentUsers();
  }, []);

  useEffect(() => {
    fetchCurrentUsers();
  }, [toggleVal]);
  console.log(usersData, "user");

  useEffect(() => {
    fetchUsers();
    fetchNotifications();
    fetchSenfFrUsers();
  }, []); // Ensure this effect runs only once
  console.log(notifData, "notif");
  console.log(user, "u");

  const currentUserFriendList = currentUser?.friendList?.map((friend) => {
    return friend.fName;
  });
  console.log(currentUserFriendList, "friendList");

  return (
    <>
      <div style={{ display: "flex", gap: "100px" }}>
        <div>
          <SideNavbar />
        </div>
        <div className="profile-container">
          <h2 className="notification-heading">Notifications</h2>
          <h4 className="request-heading">Send Friend Request</h4>
          <div className="notifications-list">
            {sendRequestUserData
              .filter(
                (userData) => userData.firstName !== currentUser?.firstName
              )
              .map((users) => (
                <div className="notification-item" key={users._id}>
                  <img
                    src={
                      localStorage.getItem(`profileImg_${users.lastName}`) ||
                      "https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png?f=webp"
                    }
                    alt="Profile"
                    className="noti-profile-image"
                  />
                  <span>
                    {users.firstName} {users.lastName}
                  </span>
                  <button
                    className="friend-request-button"
                    onClick={() => sendFriendRequest(users._id)}
                    disabled={sentFriendRequests.includes(users._id)}
                  >
                    {sentFriendRequests.includes(users._id) ? (
                      <FontAwesomeIcon icon={faCheck} /> // Already sent icon
                    ) : (
                      <FontAwesomeIcon icon={faUserPlus} /> // Send request icon
                    )}
                  </button>
                </div>
              ))}
          </div>

          <div className="notifications-list">
            <h4 className="request-heading">Friend Request</h4>
            {notifData.length > 0 ? (
              <>
                {notifData
                  ?.filter((notif) => notif.toUserId === currentUser?._id)
                  ?.map((notification, index) => (
                    <div className="notification-item" key={index}>
                      <img
                        src={
                          localStorage.getItem(
                            `profileImg_${notification.lName}`
                          ) ||
                          "https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png?f=webp"
                        }
                        alt="Profile"
                        className="noti-profile-image"
                      />
                      <span>
                        {notification.fName}
                        {notification.lName}
                      </span>
                      <button
                        className="friend-request-button"
                        onClick={() => {
                          sendFriendList(
                            notification.fName,
                            notification.lName,
                            notification.fromUserId
                          );
                        }}
                      >
                        <FontAwesomeIcon icon={faCheck} />
                      </button>
                      <button
                        className="friend-request-button"
                        onClick={() =>
                          rejectFriendList(notification.fromUserId)
                        }
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  ))}
              </>
            ) : (
              <span className="request-span">No Request </span>
            )}
          </div>
          <div className="notifications-list">
            <h4 className="request-heading">Friend List </h4>
            {usersData?.find((u) => u.firstName === currentUser.firstName)
              ?.friendList.length > 0 ? (
              <>
                {usersData
                  ?.find((u) => u.firstName === currentUser.firstName)
                  ?.friendList.map((friendList, index) => (
                    <div className="notification-item" key={currentUser._id}>
                      <img
                        src={
                          localStorage.getItem(
                            `profileImg_${friendList.lName}`
                          ) ||
                          "https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png?f=webp"
                        }
                        alt="Profile"
                        className="noti-profile-image"
                      />
                      <span>
                        {friendList.fName} {friendList.lName}
                      </span>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  ))}
              </>
            ) : (
              <span className="request-span">No Friends </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Notification;
