import { Editor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { Bold, Italic, Strikethrough } from "lucide-react";

type Props = {
  editor: Editor;
};
const EditorMain = ({ editor }: Props) => {
  return (
    <>
      <div className="relative">
        {editor.isEmpty && (
          <div className="absolute text-lg left-0 top-0 text-gray-400 pointer-events-none ">
            Tell your story
          </div>
        )}
        <EditorContent
          editor={editor}
          className="prose max-w-none m-0 outline-none "
        />
      </div>

      {/* <FloatingMenu editor={editor}>Floating menu</FloatingMenu> */}

      <BubbleMenu editor={editor}>
  <div className="flex gap-3 bg-white shadow-md px-2 py-1 rounded-lg">
    <button
      onClick={() => editor.chain().focus().toggleBold().run()}
      className={editor.isActive("bold") ? "font-bold text-black" : "hover:shadow-md hover:-translate-y-0.5 hover:border-t-gray-100  hover:border-l-gray-100 hover:border-r-gray-200 hover:border-b-gray-200 rounded-lg text-gray-500 "}
    >
      <Bold className="h-5 w-5"/>
    </button>

    <button
      onClick={() => editor.chain().focus().toggleItalic().run()}
      className={editor.isActive("italic") ? "italic text-black" : " hover:shadow-md hover:-translate-y-0.5 hover:border-t-gray-100  hover:border-l-gray-100 hover:border-r-gray-200 hover:border-b-gray-200 text-gray-500 "}
    >
      <Italic className="h-5 w-5" />
    </button>

    <button
      onClick={() => editor.chain().focus().toggleStrike().run()}
      className={editor.isActive("strike") ? "line-through text-black" : " hover:shadow-md hover:-translate-y-0.5 hover:border-t-gray-100  hover:border-l-gray-100 hover:border-r-gray-200 hover:border-b-gray-200 rounded-md text-gray-500 "}
    >
      <Strikethrough className="h-5 w-5"/>
    </button>
  </div>
</BubbleMenu>
    </>
  );
};

export default EditorMain;
