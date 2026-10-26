import Link from "next/link";
import { PostListProps } from "../types/post";

type PostDataTableProps = PostListProps & {
  currentPage: number;
  perPage: number;
  totalPosts: number;
};

function PostDataTable({ posts, currentPage, perPage, totalPosts }: PostDataTableProps) {
  const totalPages = Math.ceil(totalPosts / perPage);
  const startItem = totalPosts === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const endItem = Math.min(currentPage * perPage, totalPosts);

  return (
    <>
      <div className="table-responsive">
        <table id="postTable" className="table table-striped table-hover align-middle w-100">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Body</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td>{post.id}</td>
                <td>{post.title}</td>
                <td>{post.body}</td>
                <td>
                  <Link className="btn btn-sm btn-outline-primary" href={`/posts/${post.id}`}>
                    Read more
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mt-3">
        <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-3">
          <div className="text-muted">
            Showing {startItem} to {endItem} of {totalPosts} entries
          </div>

          <div className="btn-group" role="group" aria-label="Rows per page">
            {[5, 10, 25, 50].map((size) => (
              <Link
                key={size}
                className={`btn btn-sm ${size === perPage ? "btn-primary" : "btn-outline-primary"}`}
                href={`/post-table?page=1&perPage=${size}`}
              >
                {size}
              </Link>
            ))}
          </div>
        </div>

        <nav aria-label="Post pagination">
          <ul className="pagination mb-0">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <Link className="page-link" href={`/post-table?page=${currentPage - 1}&perPage=${perPage}`}>
                Previous
              </Link>
            </li>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <li key={page} className={`page-item ${page === currentPage ? "active" : ""}`}>
                <Link className="page-link" href={`/post-table?page=${page}&perPage=${perPage}`}>
                  {page}
                </Link>
              </li>
            ))}

            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
              <Link className="page-link" href={`/post-table?page=${currentPage + 1}&perPage=${perPage}`}>
                Next
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}

export default PostDataTable;
