import React, { useState, useEffect } from "react";
import { Container, PostCard } from "../components";
import appwriteService from "../appwrite/config";
import { useSelector } from "react-redux";
import { ErrorBoundary } from "react-error-boundary";

function ErrorFallback({ error }) {
  return (
    <div role="alert" className="p-4 text-red-500">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
    </div>
  );
}
function AllPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const refreshCount = useSelector((state) => state.post?.refreshCount || 0);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsResponse = await appwriteService.getPosts();
        if (postsResponse) {
          setPosts(postsResponse.documents);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [refreshCount]);

  if (loading) {
    return (
      <div className="w-full py-8 text-center">
        <Container>
          <h1 className="text-2xl font-bold">Loading posts...</h1>
        </Container>
      </div>
    );
  }

  return (
    <div className="w-full py-8">
      <Container>
        <div className="flex flex-wrap">
          {posts.length === 0 ? (
            <div className="w-full text-center">
              <h1 className="text-2xl font-bold">No posts found</h1>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.$id}
                className="p-2 w-full md:w-1/2 lg:w-1/3 xl:w-1/4"
              >
                <PostCard
                  $id={post.$id}
                  title={post.title}
                  featuredImage={post.featuredImage}
                />
              </div>
            ))
          )}
        </div>
      </Container>
    </div>
  );
}

export default function AllPostsWithBoundary() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <AllPosts />
    </ErrorBoundary>
  );
}
