import { useEditor, EditorContent } from "@tiptap/react";
import { FloatingMenu, BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import { MenuBar } from "./MenuBar";

const EditorMain = () => {
  const editor = useEditor({
    extensions: [StarterKit], // define your extension array
    editorProps: {
      attributes: {
        class:
          "prose prose-zinc max-w-none focus:outline-none <min-h-125></min-h-125> p-10 bg-white shadow-lg border rounded-xl mx-auto prose-ul:list-disc prose-ol:list-decimal prose-li:marker:text-gray-900",
      },
    },

    content: "<p>Hello World!</p>", // initial content
  });

  return (
    <div>
      {editor && <MenuBar editor={editor} />}

      <EditorContent editor={editor} />

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
