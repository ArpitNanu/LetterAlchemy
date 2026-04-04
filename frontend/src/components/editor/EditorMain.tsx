import { useEditor, EditorContent, EditorContext } from "@tiptap/react";
import { FloatingMenu, BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import { useMemo } from "react";
import { MenuBar } from "./MenuBar";

type Props = {
  value: any; // TipTap JSON (we’ll refine later)
  handleContentChange: (content: any) => void;
};

const EditorMain = ({ value, handleContentChange }: Props) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "<p></p>",

    onUpdate({ editor }) {
      const json = editor.getJSON();
      handleContentChange(json); //  send to parent
    },

    editorProps: {
      attributes: {
        class:
          "prose prose-zinc max-w-none focus:outline-none min-h-125 p-10 bg-white shadow-r-md shadow-b-md border rounded-xl mx-auto ",
      },
    },
  });

  const providerValue = useMemo(() => ({ editor }), [editor]);

  if (!editor) return null;

  return (
    <EditorContext.Provider value={providerValue}>
      <MenuBar /> {/* no prop drilling now */}
      <EditorContent editor={editor} />
      <FloatingMenu editor={editor}>This is the floating menu</FloatingMenu>
      <BubbleMenu editor={editor}>This is the bubble menu</BubbleMenu>
    </EditorContext.Provider>
  );
};

export default EditorMain;
