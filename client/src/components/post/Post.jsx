import "./post.css";
import { DeleteSweep, MoreVert } from "@material-ui/icons";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { format } from "timeago.js";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import Swal from "sweetalert2";

export default function Post({ post }) {
  const [like, setLike] = useState(post.likes.length);
  const [isLiked, setIsLiked] = useState(false);
  const [user, setUser] = useState({});
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const { user: currentUser } = useContext(AuthContext);

  useEffect(() => {
    setIsLiked(post.likes.includes(currentUser._id));
  }, [currentUser._id, post.likes]);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await axios.get(`/users?userId=${post.userId}`);
      setUser(res.data);
    };
    fetchUser();
  }, [post.userId]);

// call for axios to like or cancel it
  const likeHandler = () => {
    try {
      axios.put("/posts/" + post._id + "/like", { userId: currentUser._id });
    } catch (err) {}
    setLike(isLiked ? like - 1 : like + 1);
    setIsLiked(!isLiked);
  };

  // call for axios to delete a post after checking userId
  const deleteAxios = async () => {
    try {
      await axios.delete(`/posts/${post._id}`, {data: {userId: currentUser._id}});
      window.location.reload();
    } catch (err) {}  
  };

  // Swal for post deletion 
  const deleteHandler = async () => {
    Swal.fire({
      title: 'Do you want to delete?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#CD113B',
      cancelButtonColor: '#7C83FD',
      confirmButtonText: 'Delete'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteAxios();
      }
    });
  };
  
  return (
    <div className="post">
      <div className="postWrapper">
        <div className="postTop">
          <div className="postTopLeft">
          {/* Check if the post user has its profile img */}
            <Link to={`/profile/${user.username}`}>
              <img
                className="postProfileImg"
                src={
                  user.profilePicture
                    ? PF + user.profilePicture
                    : PF + "person/noAvatar.png"
                }
                alt=""
              />
            </Link>
            <span className="postUsername">{user.username}</span>
            <span className="postDate">{format(post.createdAt)}</span>
          </div>
          {/* Only the writer could remove its own post */}
          <div className="postTopRight">
            {user.username === currentUser.username
            ? <DeleteSweep onClick={deleteHandler}/>
            : <MoreVert />
            }
          </div>
        </div>
        <div className="postCenter">
          <span className="postText">{post?.desc}</span>
          <img className="postImg" src={PF + post.img} alt="" />
        </div>
        <div className="postBottom">
          <div className="postBottomLeft">
            <img
              className="likeIcon"
              src={`${PF}like.png`}
              onClick={likeHandler}
              alt=""
            />
            <img
              className="likeIcon"
              src={`${PF}heart.png`}
              onClick={likeHandler}
              alt=""
            />
            <span className="postLikeCounter">{like} people like it</span>
          </div>
          <div className="postBottomRight">
            <span className="postCommentText">
            {post.cmment} 
            {post.comment >= 2
            ? "comments"
            : "comment"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
