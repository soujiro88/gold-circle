
interface  PageProps {
  params: {
    id: number;
  };
}
async function page({params}: PageProps ) {
  const {id} = await params ;
  console.log(id);

  return (
    <div>
       Page Detail {id}
    </div>
  )
}
export default page 