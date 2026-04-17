import { Editor, EditorContent } from "@tiptap/react";
import { FloatingMenu, BubbleMenu } from "@tiptap/react/menus";

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

      <FloatingMenu editor={editor}>Floating menu</FloatingMenu>

      <BubbleMenu editor={editor}>Bubble menu</BubbleMenu>
    </>
  );
};

export default EditorMain;
