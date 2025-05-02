import React, { useEffect, useState } from "react";
import { Container, PostForm } from "../components";
import appwriteService from "../appwrite/config";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

function EditPost() {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const { slug } = useParams();
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);

  useEffect(() => {
    const fetchPost = async () => {
      if (slug) {
        try {
          const postData = await appwriteService.getPost(slug);
          if (postData) {
            // Check if current user is the post author
            if (postData.userId !== userData?.$id) {
              navigate("/");
              return;
            }
            setPost(postData);
          } else {
            navigate("/");
          }
        } catch (error) {
          console.error("Error fetching post:", error);
          navigate("/");
        }
      } else {
        navigate("/");
      }
      setLoading(false);
    };

    fetchPost();
  }, [slug, navigate, userData]);

  if (loading) {
    return (
      <div className="w-full py-8 text-center">
        <Container>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        </Container>
      </div>
    );
  }

  return post ? (
    <div className="py-8">
      <Container>
        <PostForm post={post} />
      </Container>
    </div>
  ) : null;
}

export default EditPost;
