import { useNavigate } from "react-router-dom";
import "../Styles/Dashboard.css";
import SideNavbar from "./SideNavbar";
import React, { useEffect, useState } from "react";
import CreatePost from "./CreatePost";
import "../Styles/HomePage.css";
import jwt_decode from "jwt-decode";
import "../Styles/Comment.css";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faThumbsUp,
  faComment,
  faTrash,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";
import Picker from "emoji-picker-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [currentUser, setCurrentUser] = useState({});
  const [isCreatePostOpen, setCreatePostOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [isCommentsExpanded, setIsCommentsExpanded] = useState(false);
  const [comment, setComment] = useState("");
  const [commentUid, setCommentUid] = useState("");
  const [editToggle, setEditToggle] = useState(false);
  const [deleteToggle, setDeleteToggle] = useState(false);
  const [editid, setEditid] = useState();
  const [indexiD, setindexID] = useState();
  const [toggleMypost, settoggleMypost] = useState(false);
  const [toggleFpost, settoggleFpost] = useState(false);
  const [toggleAllpost, settoggleAllpost] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [isLiked, setIsLiked] = useState(false);
  const [viewLikes, setViewLikes] = useState(false);
  const [showComments, setshowComments] = useState("Likes");
  const [postsIndex, setPostsIndex] = useState(null);
  const [usersData, setUsersData] = useState([]);
  const [showPicker, setShowPicker] = useState(false);

  const handleCreatePostClick = () => {
    setCreatePostOpen(true);
  };
  const handleEditPostClick = (id) => {
    setCreatePostOpen(true);
    setEditid(id);
    setEditToggle(true);
    console.log(id, "idd");
  };

  console.log(posts, "ph");
  console.log(comment, "This is a comment");
  console.log(user, "user");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwt_decode(token);
      setUser(decodedToken);
    }
  }, []);

  const handleCreatePost = async (newPost) => {
    try {
      const formData = new FormData();
      if (editToggle) {
        formData.append("uniqueId", editid);
        console.log(editid, "edddddiiittt");
      } else {
        formData.append("uniqueId", newPost.uniqueId);
      }
      formData.append("userId", user.userId);
      formData.append("fName", user.firstName);
      formData.append("lName", user.lastName);
      formData.append("content", newPost.content);
      formData.append("image", newPost.image); // Assuming newPost.image is the File object
      formData.append("hashtags", newPost.hashtags.join(", ")); // Convert hashtags array to a string
      formData.append("mentions", newPost.mentions.join(", "));
      formData.append("comments", newPost.comments);
      formData.append("Like", newPost.likes); // Convert mentions array to a string

      const response = await axios.post(
        "http://localhost:5000/api/auth/posts",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Set the content type to handle file uploads
          },
        }
      );

      if (response.status === 200) {
        // Post was created successfully
        console.log("Post created:", response.data);
        fetchCurrentUserPost();
        // You can perform additional actions here, like updating the UI with the new post.
      }
    } catch (error) {
      console.error("Error creating post:", error);
      // Handle the error, display an error message to the user, etc.
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
        localStorage.setItem("curUser", JSON.stringify(response.data));
        setCurrentUser(response.data);
      }
    } catch (error) {
      console.error("CurrentUser Error:", error);
    }
  };

  const fetchCurrentUserPost = () => {
    const curUser = JSON.parse(localStorage.getItem("curUser"));
    console.log(curUser, "currrrrr");
    // const decodedToken = jwt_decode(token);
    const friendsId = curUser?.friendList?.map((fr) => fr?.id);
    friendsId?.push(curUser._id);
    console.log(friendsId, "frId//////");

    axios
      .get(`http://localhost:5000/api/auth/getPostsByFriends`, {
        params: { friendsId }, // Pass the array directly as a parameter
      })
      .then((response) => {
        if (response.status === 200) {
          setPosts(response.data);
          console.log(response.data, "rrddd");
        }
      })
      .catch((error) => {
        console.error("Error fetching posts by friends:", error);
      });
  };

  const DeletePost = (uId) => {
    setDeleteToggle(true);
    axios
      .get(`http://localhost:5000/api/auth/deletePosts/${uId}`)
      .then((response) => {
        if (response.status === 200) {
          setDeleteToggle(false);
        }
      })
      .catch((error) => {
        console.error("Deleted Successfully:", error);
      });
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/auth/getUsers"
      );

      if (response.status === 200) {
        setUsersData(response.data);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchCurrentUsers();
      await fetchUsers();
      fetchCurrentUserPost();
    };
    fetchData();
  }, []);

  useEffect(() => {
    fetchCurrentUserPost();
  }, [deleteToggle]);

  useEffect(() => {
    fetchCurrentUsers();
    fetchCurrentUserPost();
  }, [localStorage.getItem("sfpost")]);

  const handleAdd = async (index) => {
    try {
      setComment("");
      const cm = {
        postuId: posts[index].uniqueId,
        comm: comment,
        fname: user.firstName,
        lname: user.lastName,
      };
      setIsCommentsExpanded(false);
      // Send the comment to the backend API
      const response = await axios.post(
        "http://localhost:5000/api/auth/comments",
        cm
      );

      if (response.status === 200) {
        console.log("Comment posted successfully:", response.data.message);

        fetchCurrentUserPost();
        // Update the comments locally or refresh the post list
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      // Handle errors here
    }
  };

  const handleLike = async (index) => {
    try {
      const likeVal = posts[index]?.likes?.find(
        (l) => l.userId === currentUser._id
      );
      console.log(likeVal, "likkkk");
      if (likeVal) {
        const l = likeVal.likeChange;
        var likeObject = {
          userId: currentUser._id,
          likeChange: !l,
        };
      } else {
        likeObject = {
          userId: currentUser._id,
          likeChange: true,
        };
      }

      const response = await axios.post(
        `http://localhost:5000/api/auth/posts/${posts[index].uniqueId}/like`,
        likeObject
      );

      if (response.status === 200) {
        fetchCurrentUserPost();
      }
    } catch (error) {
      console.error("Error liking post:", error);
      // Handle errors here
    }
  };

  const onEmojiClick = (event) => {
    setComment((prevInput) => prevInput + event.emoji);
    setShowPicker(false);
  };

  const handleAllPost = () => {
    settoggleAllpost(true);
    settoggleFpost(false);
    settoggleMypost(false);
    setActiveFilter("all");
  };
  const handleFPost = () => {
    settoggleAllpost(false);
    settoggleFpost(true);
    settoggleMypost(false);
    setActiveFilter("friends");
  };
  const handlemyPost = () => {
    settoggleAllpost(false);
    settoggleFpost(false);
    settoggleMypost(true);
    setActiveFilter("my");
  };

  console.log(editid, "cpppppppppppppppppp");

  return (
    <>
      <div style={{ display: "flex", gap: "100px" }}>
        <div>
          <SideNavbar />
        </div>

        <div className="home-page-container">
          {!isCreatePostOpen && (
            <>
              <h1>Home Page</h1>
              <button
                onClick={handleCreatePostClick}
                className="add-post-button"
              >
                <i className="fas fa-plus"></i>{" "}
                <div
                  style={{
                    textDecoration: "none",
                    textUnderlineOffset: "none",
                  }}
                >
                  Add Post
                </div>
              </button>

              <div className="filter-buttons">
                <span
                  className={`filter-button ${
                    activeFilter === "all" ? "active" : ""
                  }`}
                  onClick={handleAllPost}
                >
                  All Posts
                </span>
                <span
                  className={`filter-button ${
                    activeFilter === "friends" ? "active" : ""
                  }`}
                  onClick={handleFPost}
                >
                  Friends Posts
                </span>
                <span
                  className={`filter-button ${
                    activeFilter === "my" ? "active" : ""
                  }`}
                  onClick={handlemyPost}
                >
                  Your Posts
                </span>
              </div>
            </>
          )}

          <br />
          <br />
          {isCreatePostOpen && (
            <CreatePost
              onCreatePost={handleCreatePost}
              onClosePost={setCreatePostOpen}
              editPostid={editid}
            />
          )}
          {!isCreatePostOpen && (
            <div className="posts-container">
              {toggleMypost && (
                <>
                  <div>
                    {posts
                      ?.filter((p) => p.fName === currentUser.firstName)
                      .map((post, index) => (
                        <div key={index} className="post">
                          <div className="post-header">
                            <img
                              src={
                                localStorage.getItem(
                                  `profileImg_${post.lName}`
                                ) ||
                                "https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png?f=webp"
                              }
                              alt="Profile"
                              className="profile-photo"
                            />
                            <div className="post-setting">
                              <div className="post-user-info">
                                <p
                                  className="user-name"
                                  style={{ display: "flex", gap: "3px" }}
                                >
                                  <span>{post.fName}</span>
                                  <span>{post.lName}</span>
                                </p>
                                <p className="post-time">Posted 2 hours ago</p>
                              </div>
                              <div style={{ display: "flex", gap: "13px" }}>
                                <FontAwesomeIcon
                                  style={{
                                    cursor: "pointer",
                                  }}
                                  icon={faEdit}
                                  onClick={() =>
                                    handleEditPostClick(post.uniqueId)
                                  }
                                />
                                <FontAwesomeIcon
                                  icon={faTrash}
                                  style={{ Cursor: "pointer" }}
                                  onClick={() => DeletePost(post.uniqueId)}
                                />
                              </div>
                            </div>
                          </div>
                          {post.image && (
                            <img
                              src={`data:image/png;base64,${post.image}`}
                              alt="Selected Image"
                              className="selected-image-preview"
                            />
                          )}
                          <div className="post-content">
                            <p className="post-text">{post.content}</p>
                            <p className="hashtags">{post.hashtag}</p>
                            <p className="mentions">{post.mentions}</p>
                          </div>

                          <div className="post-actions">
                            <button
                              className={`action-button ${
                                post?.likes?.find(
                                  (l) => l.userId === currentUser._id
                                )?.likeChange
                                  ? "liked"
                                  : ""
                              }`}
                              onClick={() => handleLike(index)}
                            >
                              {post?.likes?.find(
                                (l) => l.userId === currentUser._id
                              )?.likeChange ? (
                                <>
                                  <FontAwesomeIcon icon={faThumbsUp} /> Liked
                                </>
                              ) : (
                                <>
                                  <FontAwesomeIcon icon={faThumbsUp} /> Like
                                </>
                              )}
                            </button>
                            <button
                              className="action-button"
                              onClick={() => {
                                if (!isCommentsExpanded) {
                                  setIsCommentsExpanded(true);
                                } else setIsCommentsExpanded(false);
                                setindexID(index);
                              }}
                            >
                              <FontAwesomeIcon
                                icon={faComment}
                                style={{ color: "grey" }}
                              />{" "}
                              Comment
                            </button>
                            <button
                              className="action-button"
                              onClick={() => setViewLikes((val) => !val)}
                              style={{ fontFamily: "-moz-initial" }}
                            >
                              {
                                post?.likes?.filter(
                                  (like) => like.likeChange === true
                                ).length
                              }
                              {"  "}
                              Likes and {post?.comments.length}
                              {"  "} Comments
                            </button>
                          </div>

                          {viewLikes && (
                            <div>
                              <div className="post">
                                {viewLikes && (
                                  <div className="viewLC">
                                    <div>
                                      <span
                                        onClick={() => setshowComments("Likes")}
                                        className={
                                          showComments === "Likes"
                                            ? `like-comment-button-active`
                                            : `like-comment-button`
                                        }
                                      >
                                        Likes
                                      </span>
                                    </div>
                                    <div>
                                      <span
                                        onClick={() =>
                                          setshowComments("Comments")
                                        }
                                        className={
                                          showComments === "Comments"
                                            ? `like-comment-button-active`
                                            : `like-comment-button`
                                        }
                                      >
                                        Comments
                                      </span>
                                    </div>
                                  </div>
                                )}

                                {showComments === "Likes" ? (
                                  <div className="likes-container">
                                    {post?.likes
                                      ?.filter(
                                        (like) => like.likeChange === true
                                      )
                                      ?.map((likes) => {
                                        return (
                                          <>
                                            {usersData
                                              .filter(
                                                (uD) => uD._id === likes.userId
                                              )
                                              .map((user) => {
                                                return (
                                                  <div className="comment">
                                                    <img
                                                      src={
                                                        localStorage.getItem(
                                                          `profileImg_${user.lastName}`
                                                        ) ||
                                                        "https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png?f=webp"
                                                      }
                                                      alt="Profile"
                                                      className="profile-photo"
                                                    />
                                                    <span
                                                      className="user-name"
                                                      style={{
                                                        paddingTop: "9px",
                                                      }}
                                                    >
                                                      {user.firstName}{" "}
                                                      {user.lastName}
                                                    </span>
                                                  </div>
                                                );
                                              })}
                                          </>
                                        );
                                      })}
                                  </div>
                                ) : (
                                  <div className="comments-container">
                                    {post?.comments?.map(
                                      (comment, commentIndex) => (
                                        <div
                                          className="comment"
                                          key={commentIndex}
                                        >
                                          <img
                                            src={
                                              localStorage.getItem(
                                                `profileImg_${comment.lname}`
                                              ) ||
                                              "https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png?f=webp"
                                            }
                                            alt="Profile"
                                            className="comment-profile"
                                          />
                                          <div className="comment-content">
                                            <span className="comment-name">
                                              {comment.fname}
                                              {comment.lname}
                                            </span>
                                            <span className="comment-text">
                                              {comment.comm}
                                            </span>
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {isCommentsExpanded && index === indexiD && (
                            <>
                              <div className="comment-input-container">
                                <button
                                  onClick={() => setShowPicker((val) => !val)}
                                  style={{ fontSize: "19px" }}
                                >
                                  😊
                                </button>
                                <input
                                  type="text"
                                  value={comment}
                                  onChange={(e) => {
                                    setComment(e.target.value);
                                  }}
                                  className="comment-input"
                                  placeholder="Add a comment..."
                                />
                                <button
                                  onClick={() => handleAdd(index)}
                                  className="comment-button"
                                >
                                  Post
                                </button>
                              </div>

                              {showPicker && (
                                <div
                                  style={{ height: "200px", width: "350px" }}
                                >
                                  <Picker
                                    pickerStyle={{ width: "100%" }}
                                    onEmojiClick={onEmojiClick}
                                  />
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                  </div>
                </>
              )}
              {toggleFpost && (
                <>
                  {posts
                    ?.filter((p) => p.fName !== currentUser.firstName)
                    .map((post, index) => (
                      <div key={index} className="post">
                        <div className="post-header">
                          <img
                            src={
                              localStorage.getItem(
                                `profileImg_${post.lName}`
                              ) ||
                              "https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png?f=webp"
                            }
                            alt="Profile"
                            className="profile-photo"
                          />
                          <div className="post-setting">
                            <div className="post-user-info">
                              <p
                                className="user-name"
                                style={{ display: "flex", gap: "3px" }}
                              >
                                {post.fName} {post.lName}
                              </p>
                              <p className="post-time">Posted 2 hours ago</p>
                            </div>
                          </div>
                        </div>
                        {post.image && (
                          <img
                            src={`data:image/png;base64,${post.image}`}
                            alt="Selected Image"
                            className="selected-image-preview"
                          />
                        )}
                        <div className="post-content">
                          <p className="post-text">{post.content}</p>
                          <p className="hashtags">{post.hashtag}</p>
                          <p className="mentions">{post.mentions}</p>
                        </div>

                        <div className="post-actions">
                          <button
                            className={`action-button ${
                              post?.likes?.find(
                                (l) => l.userId === currentUser._id
                              )?.likeChange
                                ? "liked"
                                : ""
                            }`}
                            onClick={() => handleLike(index)}
                          >
                            {post?.likes?.find(
                              (l) => l.userId === currentUser._id
                            )?.likeChange ? (
                              <>
                                <FontAwesomeIcon icon={faThumbsUp} /> Liked
                              </>
                            ) : (
                              <>
                                <FontAwesomeIcon icon={faThumbsUp} /> Like
                              </>
                            )}
                          </button>
                          <button
                            className="action-button"
                            onClick={() => {
                              if (!isCommentsExpanded) {
                                setIsCommentsExpanded(true);
                              } else setIsCommentsExpanded(false);
                              setindexID(index);
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faComment}
                              style={{ color: "grey" }}
                            />{" "}
                            Comment
                          </button>
                          <button
                            className="action-button"
                            onClick={() => setViewLikes((val) => !val)}
                            style={{ fontFamily: "-moz-initial" }}
                          >
                            {
                              post?.likes?.filter(
                                (like) => like.likeChange === true
                              ).length
                            }
                            {"  "}
                            Likes and {post?.comments.length}
                            {"  "} Comments
                          </button>
                        </div>

                        {viewLikes && (
                          <div>
                            <div className="post">
                              {viewLikes && (
                                <div className="viewLC">
                                  <div>
                                    <span
                                      onClick={() => setshowComments("Likes")}
                                      className={
                                        showComments === "Likes"
                                          ? `like-comment-button-active`
                                          : `like-comment-button`
                                      }
                                    >
                                      Likes
                                    </span>
                                  </div>
                                  <div>
                                    <span
                                      onClick={() =>
                                        setshowComments("Comments")
                                      }
                                      className={
                                        showComments === "Comments"
                                          ? `like-comment-button-active`
                                          : `like-comment-button`
                                      }
                                    >
                                      Comments
                                    </span>
                                  </div>
                                </div>
                              )}

                              {showComments === "Likes" ? (
                                <div className="likes-container">
                                  {post?.likes
                                    ?.filter((like) => like.likeChange === true)
                                    ?.map((likes) => {
                                      return (
                                        <>
                                          {usersData
                                            .filter(
                                              (uD) => uD._id === likes.userId
                                            )
                                            .map((user) => {
                                              return (
                                                <div className="comment">
                                                  <img
                                                    src={
                                                      localStorage.getItem(
                                                        `profileImg_${user.lastName}`
                                                      ) ||
                                                      "https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png?f=webp"
                                                    }
                                                    alt="Profile"
                                                    className="profile-photo"
                                                  />
                                                  <span
                                                    className="user-name"
                                                    style={{
                                                      paddingTop: "9px",
                                                    }}
                                                  >
                                                    {user.firstName}{" "}
                                                    {user.lastName}
                                                  </span>
                                                </div>
                                              );
                                            })}
                                        </>
                                      );
                                    })}
                                </div>
                              ) : (
                                <div className="comments-container">
                                  {post?.comments?.map(
                                    (comment, commentIndex) => (
                                      <div
                                        className="comment"
                                        key={commentIndex}
                                      >
                                        <img
                                          src={
                                            localStorage.getItem(
                                              `profileImg_${comment.lname}`
                                            ) ||
                                            "https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png?f=webp"
                                          }
                                          alt="Profile"
                                          className="comment-profile"
                                        />
                                        <div className="comment-content">
                                          <span className="comment-name">
                                            {comment.fname}
                                            {comment.lname}
                                          </span>
                                          <span className="comment-text">
                                            {comment.comm}
                                          </span>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        {isCommentsExpanded && index === indexiD && (
                          <>
                            <div className="comment-input-container">
                              <button
                                onClick={() => setShowPicker((val) => !val)}
                                style={{ fontSize: "19px" }}
                              >
                                😊
                              </button>
                              <input
                                type="text"
                                value={comment}
                                onChange={(e) => {
                                  setComment(e.target.value);
                                }}
                                className="comment-input"
                                placeholder="Add a comment..."
                              />
                              <button
                                onClick={() => handleAdd(index)}
                                className="comment-button"
                              >
                                Post
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
                          </>
                        )}

                        {/* {closeComment && ( */}
                        {/* ) */}
                        {/* } */}
                      </div>
                    ))}
                </>
              )}
              {toggleAllpost && (
                <>
                  {posts?.map((post, index) => (
                    <div key={index} className="post">
                      <div className="post-header">
                        <img
                          src={
                            localStorage.getItem(`profileImg_${post.lName}`) ||
                            "https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png?f=webp"
                          }
                          alt="Profile"
                          className="profile-photo"
                        />
                        <div className="post-setting">
                          <div className="post-user-info">
                            <p
                              className="user-name"
                              style={{ display: "flex", gap: "3px" }}
                            >
                              {post.fName} {post.lName}
                            </p>
                            <p className="post-time">Posted 2 hours ago</p>
                          </div>
                        </div>
                      </div>
                      {post.image && (
                        <img
                          src={`data:image/png;base64,${post.image}`}
                          alt="Selected Image"
                          className="selected-image-preview"
                        />
                      )}
                      <div className="post-content">
                        <p className="post-text">{post.content}</p>
                        <p className="hashtags">{post.hashtag}</p>
                        <p className="mentions">{post.mentions}</p>
                      </div>

                      <div className="post-actions">
                        <button
                          className={`action-button ${
                            post?.likes?.find(
                              (l) => l.userId === currentUser._id
                            )?.likeChange
                              ? "liked"
                              : ""
                          }`}
                          onClick={() => handleLike(index)}
                        >
                          {post?.likes?.find(
                            (l) => l.userId === currentUser._id
                          )?.likeChange ? (
                            <>
                              <FontAwesomeIcon icon={faThumbsUp} /> Liked
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon icon={faThumbsUp} /> Like
                            </>
                          )}
                        </button>
                        <button
                          className="action-button"
                          onClick={() => {
                            if (!isCommentsExpanded) {
                              setIsCommentsExpanded(true);
                            } else setIsCommentsExpanded(false);
                            setindexID(index);
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faComment}
                            style={{ color: "grey" }}
                          />{" "}
                          Comment
                        </button>
                        <button
                          className="action-button"
                          onClick={() => setViewLikes((val) => !val)}
                          style={{ fontFamily: "-moz-initial" }}
                        >
                          {
                            post?.likes?.filter(
                              (like) => like.likeChange === true
                            ).length
                          }
                          {"  "} Likes and {post?.comments.length}
                          {"  "} Comments
                        </button>
                      </div>

                      {viewLikes && (
                        <div>
                          <div className="post">
                            {viewLikes && (
                              <div className="viewLC">
                                <div>
                                  <span
                                    onClick={() => setshowComments("Likes")}
                                    className={
                                      showComments === "Likes"
                                        ? `like-comment-button-active`
                                        : `like-comment-button`
                                    }
                                  >
                                    Likes
                                  </span>
                                </div>
                                <div>
                                  <span
                                    onClick={() => setshowComments("Comments")}
                                    className={
                                      showComments === "Comments"
                                        ? `like-comment-button-active`
                                        : `like-comment-button`
                                    }
                                  >
                                    Comments
                                  </span>
                                </div>
                              </div>
                            )}

                            {showComments === "Likes" ? (
                              <div className="likes-container">
                                {post?.likes
                                  ?.filter((like) => like.likeChange === true)
                                  ?.map((likes) => {
                                    return (
                                      <>
                                        {usersData
                                          .filter(
                                            (uD) => uD._id === likes.userId
                                          )
                                          .map((user) => {
                                            return (
                                              <div className="comment">
                                                <img
                                                  src={
                                                    localStorage.getItem(
                                                      `profileImg_${user.lastName}`
                                                    ) ||
                                                    "https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png?f=webp"
                                                  }
                                                  alt="Profile"
                                                  className="profile-photo"
                                                />
                                                <span
                                                  className="user-name"
                                                  style={{ paddingTop: "9px" }}
                                                >
                                                  {user.firstName}{" "}
                                                  {user.lastName}
                                                </span>
                                              </div>
                                            );
                                          })}
                                      </>
                                    );
                                  })}
                              </div>
                            ) : (
                              <div className="comments-container">
                                {post?.comments?.map(
                                  (comment, commentIndex) => (
                                    <div className="comment" key={commentIndex}>
                                      <img
                                        src={
                                          localStorage.getItem(
                                            `profileImg_${comment.lname}`
                                          ) ||
                                          "https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png?f=webp"
                                        }
                                        alt="Profile"
                                        className="comment-profile"
                                      />
                                      <div className="comment-content">
                                        <span className="comment-name">
                                          {comment.fname}
                                          {comment.lname}
                                        </span>
                                        <span className="comment-text">
                                          {comment.comm}
                                        </span>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {isCommentsExpanded && index === indexiD && (
                        <>
                          <div className="comment-input-container">
                            <button
                              onClick={() => setShowPicker((val) => !val)}
                              style={{ fontSize: "19px" }}
                            >
                              😊
                            </button>
                            <input
                              type="text"
                              value={comment}
                              onChange={(e) => {
                                setComment(e.target.value);
                              }}
                              className="comment-input"
                              placeholder="Add a comment..."
                            />
                            <button
                              onClick={() => handleAdd(index)}
                              className="comment-button"
                            >
                              Post
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
                        </>
                      )}
                      {/* {closeComment && ( */}
                      {/* ) */}
                      {/* } */}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
