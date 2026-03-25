import type { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
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

export const MenuBar = ({ editor }: { editor: Editor }) => {
  const editorState = useEditorState({
    editor,
    selector: menuBarStateSelector,
  });

  const currentHeadling = () => {
    if (editorState.isHeading1) return "h1";
    if (editorState.isHeading2) return "h2";
    if (editorState.isHeading3) return "h3";
    if (editorState.isHeading4) return "h4";
    if (editorState.isHeading5) return "h5";
    if (editorState.isHeading6) return "h6";
    return "p";
  };

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
    <div className="control-group">
      <div className="button-group">
        <Toggle
          size="sm"
          pressed={editorState.isBold}
          onPressedChange={() => editor.chain().focus().toggleBold().run()} //button
          disabled={!editorState.canBold}
          aria-label="Toggle bold"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editorState.isItalic}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editorState.canItalic}
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editorState.isStrike}
          onPressedChange={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editorState.canStrike}
        >
          <Strikethrough className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editorState.isCode}
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editorState.canCode}
        >
          <Code />
        </Toggle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            editor.chain().focus().unsetAllMarks().clearNodes().run()
          }
        >
          <Eraser h-4 w-4 />
        </Button>
        <Toggle
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
              <Heading />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-32">
            <DropdownMenuLabel>Panel Position</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={currentHeadling()}
              onValueChange={changeHeadling}
            >
              <DropdownMenuRadioItem value="h1">
                <Heading1 className="h-4 w-4" />
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="h2">
                <Heading2 />
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="h3">
                <Heading3 />
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="h4">
                <Heading4 />
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="h5">
                <Heading5 />
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="h6">
                <Heading6 />
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Toggle
          size="sm"
          pressed={editorState.isBulletList}
          onPressedChange={() =>
            editor.chain().focus().toggleBulletList().run()
          }
        >
          <List h-4 w-4 />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editorState.isOrderedList}
          onPressedChange={() =>
            editor.chain().focus().toggleOrderedList().run()
          }
        >
          <ListOrdered />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editorState.isCodeBlock}
          onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editorState.isCodeBlock ? "is-active" : ""}
        >
          <SquareCode />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editorState.isBlockquote}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <blockquote />
        </Toggle>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <GitCommitHorizontal />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().setHardBreak().run()}
        >
          <CornerDownLeft />
        </Button>
        <Button
          variant="ghost"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editorState.canUndo}
        >
          <Undo />
        </Button>
        <Button
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
