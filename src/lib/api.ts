import { PostListProps } from "../types/post";
export async function getLastPost(): Promise<PostListProps["posts"]> {
    const posts = await fetch("https://jsonplaceholder.typicode.com/posts");
    const postsData = await posts.json(); 
    return postsData;

}
