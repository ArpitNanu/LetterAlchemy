import { Logo } from "../Logo";

export const RecommdeationRightSideBar = () => {
  return (
    <div className="bg-[#EEF5F7] border border-border-subtle h-full">
      <div className="flex">
        <Logo className="w-6 h-6 text-brand-primary" />
        
      </div>
      <p className="text-text-muted text-sm">
        Spack inspiration for your next masterpiece
      </p>
      <div>
        <h2 className="text-text-muted text-sm font-bold">WRITING PROMPTS </h2>
      </div>
    </div>
  );
};
