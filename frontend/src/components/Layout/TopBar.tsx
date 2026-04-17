import { Menu, Search, SquarePen } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const TopBar = () => {
  const navigate = useNavigate();
  return (
    <div>
      <div className="flex justify-between m-2  items-center border-gray-50 border-2">
        <Menu />
        <h1>LetterAlchemy</h1>
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
            navigate("/editor");
          }}
          className="flex gap-1 cursor-pointer"
        >
          <SquarePen />
          <span>Write</span>
        </button>
        <button className="bg-gray-100 p-2 rounded-full w-12 h-12 cursor-pointer"></button>
      </div>
    </div>
  );
};
