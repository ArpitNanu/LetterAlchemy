type Props = {
  value: string;
  handleTitleChange: (value: string) => void;
};

export const Title = ({ value, handleTitleChange }: Props) => {
  return (
    <div className="">
      <input
        className="text-4xl border-b-2 focus:outline-none focus:ring focus:ring-muted "
        type="text"
        value={value}
        id="myinput"
        placeholder="Tite"
        onChange={(e) => handleTitleChange(e.target.value)}
      />
    </div>
  );
};
