export const TopBarEditor = () => {
  return (
    <div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 240 40"
        className="text-zinc-900 h-8"
        fill="none"
      >
        <rect
          x="2"
          y="14"
          width="24"
          height="18"
          rx="2"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M2 14l12 9 12-9"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M16 2 l1 3 3 1 -3 1 -1 3 -1 -3 -3 -1 3 -1 z"
          fill="currentColor"
        />
        <path
          d="M24 8 l0.5 1.5 1.5 0.5 -1.5 0.5 -0.5 1.5 -0.5 -1.5 -1.5 -0.5 1.5 -0.5 z"
          fill="currentColor"
        />

        <text
          x="36"
          y="29"
          fill="currentColor"
          fontFamily="Montserrat, sans-serif"
          fontSize="22"
          fontWeight="700"
        >
          Letter
        </text>
        <text
          x="113"
          y="29"
          fill="currentColor"
          fontFamily="Montserrat, sans-serif"
          fontSize="22"
          fontWeight="300"
        >
          Alchemy
        </text>
      </svg>
      
    </div>
  );
};

export default TopBarEditor;
