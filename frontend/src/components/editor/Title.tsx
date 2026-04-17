type Props = {
  value: string;
  handleTitleChange: (value: string) => void;
};

export const Title = ({ value, handleTitleChange }: Props) => {
  return (
    <div className="">
      <textarea
        className=" w-full text-5xl
    font-bold
    leading-tight
    outline-none
    resize-none
    bg-transparent
    placeholder-gray-400  "
        value={value}
        id="myinput"
        placeholder="Title"
        onChange={(e) => handleTitleChange(e.target.value)}
      />
    </div>
  );
};
