export const CommentInput = () => {
  return (
    <div>
      <form action="">
        <label htmlFor="">
          <textarea
            className="border border-border-subtle outline-none w-full p-2 rounded-md resize-none focus:ring-2 focus:ring-brand-primary"
            rows={4}
            cols={50}
            name=""
            id=""
            maxLength={250}
            placeholder="Add to the discussion"
          ></textarea>
          <br />
          <button
            className="cursor-pointer bg-brand-highlight border-brand-primary text-black text-md hover:bg-brand-primary hover:text-green-50 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 rounded-md p-1"
            type="submit"
          >
            Comment
          </button>
        </label>
      </form>
    </div>
  );
};
