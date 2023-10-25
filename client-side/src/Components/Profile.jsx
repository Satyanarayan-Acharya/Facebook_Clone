import { React, createRef, useEffect, useState } from "react";
import SideNavbar from "./SideNavbar";
import jwt_decode from "jwt-decode";
import "../Styles/Profile.css";

const Profile = () => {
  const [user, setUser] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = createRef();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwt_decode(token);
      setUser(decodedToken);
    }

    const savedImage = localStorage.getItem(
      `profileImg_${jwt_decode(token).lastName}`
    );
    if (savedImage) {
      setProfileImage(savedImage);
    }
  }, []);

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImage(event.target.result);
        localStorage.setItem(
          `profileImg_${user.lastName}`,
          event.target.result
        );
      };
      reader.readAsDataURL(file);
    }
  };
  console.log(user.dob, "//");

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <>
      <div style={{ display: "flex", gap: "100px" }}>
        <div>
          <SideNavbar />
        </div>
        <div className="profile-container">
          <h2>User Profile</h2>
          <div className="profile-image-container">
            <img
              src={
                profileImage ||
                "https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png?f=webp"
              }
              alt="Profile"
            />
          </div>
          <button className="upload-button" onClick={handleUploadClick}>
            Upload Profile Photo
          </button>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            style={{ display: "none" }}
            ref={fileInputRef}
          />
          <p className="profile-info">
            Name: {user.firstName} {user.lastName}
          </p>
          <p className="profile-info"> Email: {user.email}</p>
          <p className="profile-info">
            Date of Birth: {new Date(user.dob).getDate()}{" "}
            {new Date(user.dob).toLocaleString("en-US", { month: "long" })}{" "}
            {new Date(user.dob).getFullYear()}
          </p>
          <p className="profile-info">Gender: {user.gender}</p>
        </div>
      </div>
    </>
  );
};

export default Profile;
