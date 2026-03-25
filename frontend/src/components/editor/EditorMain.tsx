import { useEditor, EditorContent } from "@tiptap/react";
import { FloatingMenu, BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import { MenuBar } from "./MenuBar";

const EditorMain = () => {
  const editor = useEditor({
    extensions: [StarterKit], // define your extension array
    content: "<p>Hello World!</p>", // initial content
  });

  return (
    <div>
      {editor && <MenuBar editor={editor} />}

      <EditorContent
        editor={editor}
        className="prose prose-slate max-w-none focus:outline-none min-h-125"
      />

      {editor && (
        <FloatingMenu editor={editor}>This is the floating menu</FloatingMenu>
      )}
      {editor && (
        <BubbleMenu editor={editor}>This is the bubble menu</BubbleMenu>
      )}
    </div>
  );
};

export default EditorMain;
