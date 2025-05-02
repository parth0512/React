import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import appwriteService from "../appwrite/config";

function PostCard({ $id, title, featuredImage, content, userId }) {
  const currentUser = useSelector((state) => state.auth.userData);
  const isAuthor = currentUser?.$id === userId;

  const handleDelete = async (e) => {
    e.preventDefault();
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await appwriteService.deletePost($id);
        window.location.reload();
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };

  return (
    <div className="relative group">
      <Link
        to={`/post/${$id}`}
        className="block hover:scale-[1.02] transition-all"
      >
        <div className="w-full bg-gray-100 rounded-xl p-4 h-full">
          {featuredImage && (
            <div className="w-full mb-4 aspect-video overflow-hidden">
              <img
                src={featuredImage}
                alt={title || "Post image"}
                className="rounded-xl w-full h-full object-cover"
              />
            </div>
          )}
          <h2 className="text-xl font-bold truncate">{title}</h2>
          {content && (
            <p className="mt-2 text-gray-600 line-clamp-3">
              {content.replace(/<[^>]+>/g, "")}
            </p>
          )}
        </div>
      </Link>

      {/* Only show buttons if current user is the author */}
      {isAuthor && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex gap-2">
            <Link
              to={`/edit-post/${$id}`}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
              onClick={(e) => e.stopPropagation()}
            >
              Edit
            </Link>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(e);
              }}
              className="bg-red-500 text-white px-3 py-1 rounded text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PostCard;
