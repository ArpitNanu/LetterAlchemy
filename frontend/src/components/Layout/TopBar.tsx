import { BookOpen, Menu, Search, SquarePen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import UserDropdown from "../ui/UserDropdown";

export const TopBar = () => {
  const navigate = useNavigate();
  return (
    <div>
      <div className="flex justify-between items-center m-2 border-2 border-t-0 border-l-0 border-r-0 border-b-border-subtle">
        <div className=" flex gap-1 cursor-pointer items-center ">
          <BookOpen className="text-brand-primary" />
          <h1 className="text-2xl font-serif font-bold text-brand-primary">LetterAlchemy</h1>
        </div>
        <div className="flex rounded-4xl  bg-gray-100">
          <Search className="top-3 m-3" />
          <input
            className="outline-none px-2 flex-1"
            type="text"
            placeholder="Search"
          />
        </div>

        <button
          onClick={() => {
            navigate("/editor/new");
          }}
          className="flex gap-1 cursor-pointer"
        >
          <SquarePen />
          <span>Write</span>
        </button>
        <UserDropdown
          name="Bonnie Green"
          email="name@flowbite.com"
          avatarUrl="/docs/images/people/profile-picture-5.jpg"
        />
      </div>
    </div>
  );
};
