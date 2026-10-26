import React from 'react' 
import Link from "next/link";
import { PostListProps } from "../types/post";
 

async function PostList({ posts }: PostListProps) {  
  return ( 
      posts.map((post) => (
        <div key={post.id} className="post-item">
          <h2>{post.title}</h2>
          <p>{post.body}</p>
          <Link href={`/posts/${post.id}`}>Read more</Link>
        </div>
      ))
    
  )
}

export default PostList   