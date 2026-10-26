import PostDataTable from "../../components/PostDataTable";
import { getLastPost } from "../../lib/api";

type PostTableProps = {
  searchParams: Promise<{
    page?: string;
    perPage?: string;
  }>;
};

async function PostTable({ searchParams }: PostTableProps) {
  const posts = await getLastPost();
  const params = await searchParams;
  const requestedPerPage = Number(params.perPage) || 10;
  const perPage = [5, 10, 25, 50].includes(requestedPerPage) ? requestedPerPage : 10;
  const requestedPage = Number(params.page) || 1;
  const totalPages = Math.max(Math.ceil(posts.length / perPage), 1);
  const currentPage = Math.min(Math.max(requestedPage, 1), totalPages);
  const startIndex = (currentPage - 1) * perPage;
  const paginatedPosts = posts.slice(startIndex, startIndex + perPage);

  return (
    <>
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
      />

      <div className="container py-5">
        <div className="card shadow-sm border-0">
          <div className="card-header bg-primary text-white">
            <h1 className="h4 mb-0">PostTable</h1>
          </div>

          <div className="card-body">
            <PostDataTable
              posts={paginatedPosts}
              currentPage={currentPage}
              perPage={perPage}
              totalPosts={posts.length}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default PostTable;
