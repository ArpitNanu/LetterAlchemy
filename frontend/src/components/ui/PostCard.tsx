import { Bookmark, CalendarDays, Heart } from "lucide-react";

type Post = {
  id: string;
  title: string;
  text: unknown;
};

type PostcardProp = {
  posts:Post[]
}
export const PostCard = ({ posts }:PostcardProp) => {
  return (
    <div className="bg-neutral-primary-soft m-4 ">
      {posts?.map((post) => {
        return (
          <div key={post.id} className="flex flex-col p-2">
            <div>authorname</div>
            <div className=" flex gap-x-20 ">
              <div className="flex flex-col gap-8 ">
                <div>
                  <div>
                    <h2 className="text-2xl font-bold text-headingtext-xl">
                      {post.title}
                    </h2>
                    <p className="text-md text-gray-500  text-body ">
                      {/* {post.text} */}
                    </p>
                  </div>
                </div>
                <div className=" flex  ">
                  <CalendarDays />
                  <Heart />
                  <Bookmark />
                  readtime
                </div>
              </div>
              {/* <img
                className="rounded-md border-b border-r w-50 h-50 shadow-xl "
                src={post.image}
                alt="post"
              /> */}
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default PostCard;
