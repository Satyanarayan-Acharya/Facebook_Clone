import { faVolumeHigh } from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import "../Styles/CreatePost.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudUploadAlt } from "@fortawesome/free-solid-svg-icons";

function CreatePost(props) {
  const [formData, setFormData] = useState({
    postContent: "",
    selectedImage: null,
    hashtagValue: "",
    mentionValue: "",
    commentValue: [],
    likeValue: false,
  });
  const [editImg, setEditImg] = useState(false);
  const [img, setImg] = useState(null); // To store the selected image
  const [imgUrl, setImgUrl] = useState(""); // To store the image URL

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file" && files.length > 0) {
      // If a file is selected, set it in 'img' state
      setImg(files[0]);

      // Read the file and set its URL in 'imgUrl' state
      const reader = new FileReader();
      reader.onload = (e) => {
        setImgUrl(e.target.result);
      };
      reader.readAsDataURL(files[0]);
    } else {
      setImg(null); // Clear the 'img' state if no file is selected
      setImgUrl(""); // Clear the 'imgUrl' state
    }

    setFormData({
      ...formData,
      [name]: type === "file" ? files[0] : value,
    });
  };

  const fetchEditPost = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/auth/getEditPost/${props.editPostid}`
      );

      if (response.status === 200) {
        console.log("EditPost", response.data);
        setFormData({
          postContent: response.data.content,
          selectedImage: response.data.image,
          hashtagValue: response.data.hashtags.map((h) => h).join(" "),
          mentionValue: response.data.mentions.map((m) => m).join(" "),
          commentValue: [],
          likeValue: false,
        });
        setEditImg(true);
      }
    } catch (error) {
      console.error("EditPost Error:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await props.editPostid;
      fetchEditPost();
    };
    fetchData();
  }, []);

  console.log(props.editPostid, "///ee//pp");
  const handleCreatePost = () => {
    console.log(formData, "ffffrrrrr");
    const uniqueId = uuidv4();
    // Create a new post object with the form data
    const newPost = {
      uniqueId: uniqueId,
      content: formData.postContent,
      image: formData.selectedImage,
      hashtags: formData.hashtagValue.split(" "),
      mentions: formData.mentionValue.split(" "),
      comments: formData.commentValue,
      likes: formData.likeValue,
    };

    // Call the parent component's callback to add the new post
    props.onCreatePost(newPost);
    props.onClosePost(false);
    // Send the formData to the server for processing
    // Example: axios.post('/api/posts', formData);
    // onCreatePost(formData);
    // Clear form fields after posting
    setFormData({
      postContent: "",
      selectedImage: null,
      hashtagValue: "",
      mentionValue: "",
    });
    setEditImg(false);
    // Call the onCreatePost callback to notify the parent component
  };
  console.log(img, "img");

  console.log(props.editCreate, props.editform, "/-/");

  const fileInputRef = React.createRef();

  return (
    <div className="create-post-container">
      {editImg ? (
        <>
          <h2>Edit Post</h2>
        </>
      ) : (
        <>
          <h2>Create Post</h2>
        </>
      )}
      <textarea
        name="postContent"
        placeholder="What's on your mind?"
        value={formData.postContent}
        onChange={handleInputChange}
        className="post-content-input"
      />
      <input
        type="text"
        name="hashtagValue"
        placeholder="Add hashtags (e.g., #example)"
        value={formData.hashtagValue}
        onChange={handleInputChange}
        className="hashtag-input"
      />
      <input
        type="text"
        name="mentionValue"
        placeholder="Mention users (e.g., @username)"
        value={formData.mentionValue}
        onChange={handleInputChange}
        className="mention-input"
      />
      <label htmlFor="image-upload" className="image-upload-button">
        <FontAwesomeIcon icon={faCloudUploadAlt} /> Upload Image
      </label>
      <input
        id="image-upload"
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        style={{ display: "none" }}
        ref={fileInputRef}
        name="selectedImage"
      />
      <br />
      {imgUrl && <img src={imgUrl} alt="Selected" className="image-preview" />}
      {editImg && (
        <img
          src={`data:image/png;base64,${formData.selectedImage}`}
          alt="Selected"
          className="image-preview"
        />
      )}
      <br />
      <br />
      {editImg ? (
        <button onClick={handleCreatePost} className="post-button">
          Edit Post
        </button>
      ) : (
        <button onClick={handleCreatePost} className="post-button">
          Post
        </button>
      )}
    </div>
  );
}

export default CreatePost;
