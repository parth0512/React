import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Input, RTE, Select } from "..";
import appwriteService from "../../appwrite/config";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { refreshPosts } from "../../store/postSlice";
import { useDispatch } from "react-redux";
import imageCompression from "browser-image-compression";

export default function PostForm({ post, readOnly = false }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: post?.title || "",
      slug: post?.slug || "",
      content: post?.content || "",
      status: post?.status || "active", // Ensure default status
      featuredImage: post?.featuredImage || "",
    },
  });
  const submit = async (data) => {
    try {
      setIsSubmitting(true);
      const postData = {
        ...data,
        userId: userData?.$id,
      };

      // Add validation for Base64 image size
      if (!post && data.featuredImage?.length > 10_000_000) {
        // ~10MB
        throw new Error("Image size must be less than 10MB");
      }

      let dbPost;
      if (post) {
        dbPost = await appwriteService.updatePost(post.$id, postData);
      } else {
        dbPost = await appwriteService.createPost(postData);
      }

      if (dbPost) {
        dispatch(refreshPosts());
        navigate("/all-posts");
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const slugTransform = useCallback((value) => {
    if (value && typeof value === "string") {
      return value
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z\d\s]+/g, "-")
        .replace(/\s/g, "-");
    }
    return "";
  }, []);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const options = {
        maxSizeMB: 1, // Compress to max 1MB
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);

      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result;
        setValue("featuredImage", base64String, { shouldValidate: true });
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.log("Compression error:", error);
      alert("Failed to process image");
    }
  };

  const handleRemoveImage = () => {
    setValue("featuredImage", "", { shouldValidate: true });
  };

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "title") {
        setValue("slug", slugTransform(value.title), { shouldValidate: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, slugTransform, setValue]);

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-wrap">
      <div className="w-2/3 px-2">
        <Input
          label="Title :"
          placeholder="Title"
          className="mb-4"
          {...register("title", { required: "Title is required" })}
        />
        {errors.title && (
          <p className="text-red-500 text-sm">{errors.title.message}</p>
        )}

        <Input
          label="Slug :"
          placeholder="Slug"
          className="mb-4"
          {...register("slug", {
            required: "Slug is required",
            pattern: {
              value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
              message:
                "Invalid slug format (use lowercase, numbers, and hyphens)",
            },
          })}
          onInput={(e) => {
            setValue("slug", slugTransform(e.currentTarget.value), {
              shouldValidate: true,
            });
          }}
        />
        {errors.slug && (
          <p className="text-red-500 text-sm">{errors.slug.message}</p>
        )}

        <RTE
          label="Content :"
          name="content"
          control={control}
          defaultValue={getValues("content")}
        />
      </div>

      <div className="w-1/3 px-2">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Featured Image :
          </label>
          <input
            type="file"
            accept="image/png, image/jpg, image/jpeg, image/gif"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <input
            type="hidden"
            {...register("featuredImage", {
              required: !post ? "Image is required" : false,
            })}
          />
          {errors.featuredImage && (
            <p className="text-red-500 text-sm">
              {errors.featuredImage.message}
            </p>
          )}
        </div>

        {getValues("featuredImage") && (
          <div className="w-full mb-4 relative">
            <img
              src={getValues("featuredImage")}
              alt={getValues("title") || "Post image"}
              className="rounded-lg w-full h-48 object-cover"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 w-6 h-6 flex items-center justify-center"
              aria-label="Remove image"
            >
              ×
            </button>
          </div>
        )}

        <Select
          options={["active", "inactive"]}
          label="Status"
          className="mb-4"
          {...register("status", { required: "Status is required" })}
        />
        {errors.status && (
          <p className="text-red-500 text-sm">{errors.status.message}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 rounded-lg text-white ${
            post ? "bg-green-500" : "bg-blue-600"
          } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isSubmitting ? "Processing..." : post ? "Update" : "Submit"}
        </button>
      </div>
    </form>
  );
}
