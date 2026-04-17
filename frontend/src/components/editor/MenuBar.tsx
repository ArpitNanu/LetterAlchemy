import { useCurrentEditor, useEditorState } from "@tiptap/react";
import {
  Bold,
  Code,
  CornerDownLeft,
  Eraser,
  GitCommitHorizontal,
  Heading,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Italic,
  List,
  ListOrdered,
  Pilcrow,
  Redo,
  SquareCode,
  Strikethrough,
  Undo,
} from "lucide-react";

import { menuBarStateSelector } from "./menuBarState";

import { Toggle } from "../ui/toggle";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const HEADING_ICONS = {
  h1: { icon: Heading1, label: "Heading 1" },
  h2: { icon: Heading2, label: "Heading 2" },
  h3: { icon: Heading3, label: "Heading 3" },
  h4: { icon: Heading4, label: "Heading 4" },
  h5: { icon: Heading5, label: "Heading 5" },
  h6: { icon: Heading6, label: "Heading 6" },
  p: { icon: Heading, label: "Heading" },
} as const;

export const MenuBar = () => {
  const { editor } = useCurrentEditor();
  if (!editor) return null;
  const editorState = useEditorState({
    editor,
    selector: menuBarStateSelector,
  });

  const currentheading = () => {
    if (editorState.isHeading1) return "h1";
    if (editorState.isHeading2) return "h2";
    if (editorState.isHeading3) return "h3";
    if (editorState.isHeading4) return "h4";
    if (editorState.isHeading5) return "h5";
    if (editorState.isHeading6) return "h6";
    return "p";
  };

  const currentKey = currentheading();
  const CurrentIcon =
    HEADING_ICONS[currentKey as keyof typeof HEADING_ICONS]?.icon || Heading; // need to understand this better

  const changeHeadling = (head: string) => {
    if (head === "h1")
      return editor.chain().focus().toggleHeading({ level: 1 }).run();
    if (head === "h2")
      return editor.chain().focus().toggleHeading({ level: 2 }).run();
    if (head === "h3")
      return editor.chain().focus().toggleHeading({ level: 3 }).run();
    if (head === "h4")
      return editor.chain().focus().toggleHeading({ level: 4 }).run();
    if (head === "h5")
      return editor.chain().focus().toggleHeading({ level: 5 }).run();
    if (head === "h6")
      return editor.chain().focus().toggleHeading({ level: 6 }).run();
  };
  return (
    <div className="control-group bg-gray-50 flex gap-2  justify-center items-center rounded-2xl p-2 h-min w-fit shadow-xl ring-white border-t-gray-200 border-l-gray-200 text-gray-500 border-b-gray-500 border-r-gray-500 hover:bg-white hover:text-gray-600 ">
      <div className="button-group">
        <Toggle
          className=" hover:shadow-md hover:-translate-y-0.5 hover:border-t-gray-100  hover:border-l-gray-100 hover:border-r-gray-200 hover:border-b-gray-200 data-[state=on]:text-black"
          size="sm"
          pressed={editorState.isBold}
          onPressedChange={() => editor.chain().focus().toggleBold().run()} //button
          disabled={!editorState.canBold}
          aria-label="Toggle bold"
        >
          <Bold className="h-4 w-4 " />
        </Toggle>

        <Toggle
          className=" hover:shadow-md hover:-translate-y-0.5 hover:border-t-gray-100  hover:border-l-gray-100 hover:border-r-gray-200 hover:border-b-gray-200 data-[state=on]:text-black"
          size="sm"
          pressed={editorState.isItalic}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editorState.canItalic}
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle
          className=" hover:shadow-md hover:-translate-y-0.5 hover:border-t-gray-100  hover:border-l-gray-100 hover:border-r-gray-200 hover:border-b-gray-200 data-[state=on]:text-black"
          size="sm"
          pressed={editorState.isStrike}
          onPressedChange={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editorState.canStrike}
        >
          <Strikethrough className="h-4 w-4" />
        </Toggle>
        <Toggle
          className=" hover:shadow-md hover:-translate-y-0.5 hover:border-t-gray-100  hover:border-l-gray-100 hover:border-r-gray-200 hover:border-b-gray-200 data-[state=on]:text-black"
          size="sm"
          pressed={editorState.isCode}
          onPressedChange={() => editor.chain().focus().toggleCode().run()}
          disabled={!editorState.canCode}
        >
          <Code />
        </Toggle>
        <Button
          className=" hover:shadow-md hover:-translate-y-0.5 hover:border-t-gray-100  hover:border-l-gray-100 hover:border-r-gray-200 hover:border-b-gray-200 data-[state=on]:text-black"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
        >
          <Eraser className="h-4 w-4" />
        </Button>
        <Toggle
          className=" hover:shadow-md hover:-translate-y-0.5 hover:border-t-gray-100  hover:border-l-gray-100 hover:border-r-gray-200 hover:border-b-gray-200 data-[state=on]:text-black"
          size="sm"
          pressed={editorState.isParagraph}
          onPressedChange={() => editor.chain().focus().setParagraph().run()}
        >
          <Pilcrow className=" w-4 h-4" />
        </Toggle>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">
              {" "}
              <CurrentIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-32">
            <DropdownMenuLabel>Panel Position</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={currentheading()}
              onValueChange={changeHeadling}
            >
              {Object.entries(HEADING_ICONS).map(
                ([key, { icon: Icon, label }]) => (
                  <DropdownMenuRadioItem
                    key={key}
                    value={key}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </DropdownMenuRadioItem>
                ),
              )}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Toggle
          className=" hover:shadow-md hover:-translate-y-0.5 hover:border-t-gray-100  hover:border-l-gray-100 hover:border-r-gray-200 hover:border-b-gray-200 data-[state=on]:text-black"
          size="sm"
          pressed={editorState.isBulletList}
          onPressedChange={() =>
            editor.chain().focus().toggleBulletList().run()
          }
        >
          <List h-4 w-4 />
        </Toggle>
        <Toggle
          className=" hover:shadow-md hover:-translate-y-0.5 hover:border-t-gray-100  hover:border-l-gray-100 hover:border-r-gray-200 hover:border-b-gray-200 data-[state=on]:text-black"
          size="sm"
          pressed={editorState.isOrderedList}
          onPressedChange={() =>
            editor.chain().focus().toggleOrderedList().run()
          }
        >
          <ListOrdered />
        </Toggle>
        <Toggle
          className=" hover:shadow-md hover:-translate-y-0.5 hover:border-t-gray-100  hover:border-l-gray-100 hover:border-r-gray-200 hover:border-b-gray-200 data-[state=on]:text-black"
          size="sm"
          pressed={editorState.isCodeBlock}
          onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <SquareCode />
        </Toggle>

        <Toggle
          className=" hover:shadow-md hover:-translate-y-0.5 hover:border-t-gray-100  hover:border-l-gray-100 hover:border-r-gray-200 hover:border-b-gray-200 data-[state=on]:text-black"
          size="sm"
          pressed={editorState.isBlockquote}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <blockquote className="w-4 h-4" />
        </Toggle>
        <Button
          className=" hover:shadow-md hover:-translate-y-0.5 hover:border-t-gray-100  hover:border-l-gray-100 hover:border-r-gray-200 hover:border-b-gray-200 data-[state=on]:text-black"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <GitCommitHorizontal />
        </Button>
        <Button
          className=" hover:shadow-md hover:-translate-y-0.5 hover:border-t-gray-100  hover:border-l-gray-100 hover:border-r-gray-200 hover:border-b-gray-200 data-[state=on]:text-black"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().setHardBreak().run()}
        >
          <CornerDownLeft />
        </Button>
        <Button
          className=" hover:shadow-md hover:-translate-y-0.5 hover:border-t-gray-100  hover:border-l-gray-100 hover:border-r-gray-200 hover:border-b-gray-200 data-[state=on]:text-black"
          variant="ghost"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editorState.canUndo}
        >
          <Undo />
        </Button>
        <Button
          className=" hover:shadow-md hover:-translate-y-0.5 hover:border-t-gray-100  hover:border-l-gray-100 hover:border-r-gray-200 hover:border-b-gray-200 data-[state=on]:text-black"
          variant="ghost"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editorState.canRedo}
        >
          <Redo />
        </Button>
      </div>
    </div>
  );
};
