import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faUser,
  faEnvelope,
  faBell,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import "../Styles/Notification.css";

const SideNavbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [usersData, setUsersData] = useState([]);
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const isNotify = localStorage.getItem("isNotify");

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
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwt_decode(token);
      setUser(decodedToken);
    }
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [isNotify]);

  console.log(usersData, "uD");
  return (
    <>
      <div className="SideNavbar">
        <ul>
          <li onClick={() => navigate("/profile")}>
            {" "}
            <div className="profile">
              <img
                src={
                  localStorage.getItem(`profileImg_${user.lastName}`) ||
                  "https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png?f=webp"
                }
                alt="profile"
                height="64px"
                width="70px"
              />
              <span>
                {user.firstName} {user.lastName}
              </span>
            </div>
            {/* <div className="user-name">{user.firstName}</div> */}
          </li>
          <li className="navbar-item" onClick={() => navigate("/dashboard")}>
            <FontAwesomeIcon icon={faHome} /> Home
          </li>
          <li className="navbar-item" onClick={() => navigate("/profile")}>
            <FontAwesomeIcon icon={faUser} /> Profile
          </li>
          <li className="navbar-item" onClick={() => navigate("/messages")}>
            <FontAwesomeIcon icon={faEnvelope} /> Messages
          </li>
          <li
            className="navbar-item"
            onClick={() => {
              navigate("/notifications");
              localStorage.setItem("isNotify", true);
            }}
          >
            <FontAwesomeIcon icon={faBell} /> Notifications
            {usersData?.find((u) => u.firstName === user.firstName)
              ?.notifications.length > 0 && (
              <span className="notification-badge">
                {
                  usersData?.find((u) => u.firstName === user.firstName)
                    ?.notifications.length
                }
              </span>
            )}
          </li>
          <li className="navbar-item" onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} /> Logout
          </li>
        </ul>
      </div>
    </>
  );
};

export default SideNavbar;
