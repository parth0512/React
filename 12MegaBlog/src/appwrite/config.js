import conf from "../conf/conf.js";
import { Client, ID, Databases, Query } from "appwrite";

export class Service {
  client = new Client();
  databases;

  constructor() {
    this.client
      .setEndpoint(conf.appwriteUrl)
      .setProject(conf.appwriteProjectId);
    this.databases = new Databases(this.client);
  }

  // In your config.js createPost method
  async createPost({ title, slug, content, featuredImage, status, userId }) {
    try {
      return await this.databases.createDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        ID.unique(),
        {
          title,
          slug,
          content,
          featuredImage: featuredImage.substring(0, 999999), // Ensure limit
          status,
          userId,
        }
      );
    } catch (error) {
      console.log("Appwrite service :: createPost :: error", error);
      throw error;
    }
  }
  async updatePost(
    documentId,
    { title, slug, content, featuredImage, status }
  ) {
    try {
      return await this.databases.updateDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        documentId,
        {
          title,
          slug,
          content,
          featuredImage,
          status,
        }
      );
    } catch (error) {
      console.log("Appwrite service :: updatePost :: error", error);
      throw error;
    }
  }

  async deletePost(documentId) {
    try {
      await this.databases.deleteDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        documentId
      );
      return true;
    } catch (error) {
      console.log("Appwrite service :: deletePost :: error", error);
      return false;
    }
  }

  async getPost(documentId) {
    try {
      return await this.databases.getDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        documentId
      );
    } catch (error) {
      console.log("Appwrite service :: getPost :: error", error);
      return null;
    }
  }

  async getPosts(queries = [Query.equal("status", "active")]) {
    try {
      return await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        queries
      );
    } catch (error) {
      console.log("Appwrite service :: getPosts :: error", error);
      return { documents: [] };
    }
  }

  // New method to get posts by slug
  async getPostBySlug(slug) {
    try {
      return await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        [Query.equal("slug", slug)]
      );
    } catch (error) {
      console.log("Appwrite service :: getPostBySlug :: error", error);
      return null;
    }
  }
}

const service = new Service();
export default service;
