import { BookOpen, Sparkles, BookText, Zap, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FeatureCard } from "@/components/ui/FeatureCard";

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-[#FDFDFD] text-text-main font-sans selection:bg-brand-primary/20 overflow-hidden flex flex-col">
      
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-8 py-4 max-w-6xl mx-auto w-full shrink-0">
        <div className="flex items-center gap-2 font-bold text-lg cursor-pointer">
          <BookOpen className="text-brand-primary w-4 h-4" />
          LetterAlchemy
        </div>

        <div className="flex items-center gap-4 text-sm font-medium">
          <button onClick={() => navigate("/login")} className="hover:text-brand-primary transition-colors">Sign In</button>
          <button onClick={() => navigate("/signup")} className="bg-brand-primary text-white px-4 py-2 rounded-full hover:bg-brand-highlight transition-colors">
            Get Started
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="max-w-6xl mx-auto px-8 pt-4 pb-8 text-center flex flex-col items-center shrink-0">
        <div className="inline-flex items-center gap-2 bg-[#F1F3F0] text-text-muted text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
          <Sparkles className="w-2.5 h-2.5 text-brand-primary" /> Introducing LetterAlchemy 2.0
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3 max-w-4xl mx-auto">
          The Sanctuary for <br /> <span className="text-brand-primary">Digital Alchemy.</span>
        </h1>
        
        <p className="text-text-muted text-sm md:text-base max-w-xl mx-auto mb-6 leading-relaxed">
          Experience the perfect harmony of undisturbed focus and intelligent assistance. Transform fragmented thoughts into structured brilliance.
        </p>
        
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/editor/new")} className="flex items-center gap-2 bg-brand-primary text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-brand-highlight transition-all shadow-sm">
            Start Writing <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 bg-white border border-border-subtle text-text-main px-5 py-2 rounded-full text-sm font-medium hover:border-brand-primary transition-all shadow-sm"
          >
            Explore the Grid
          </button>
        </div>
      </main>

      {/* BENTO GRID FEATURES SECTION */}
      <section className="max-w-6xl mx-auto px-8 pb-8 flex-1 min-h-0 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
          
          {/* Write in the Flow */}
          <FeatureCard
            title="Write in the Flow"
            description="Focus Mode blurs distractions."
            className="md:col-span-2"
          >
            <div className="bg-white rounded-xl shadow-sm border border-border-subtle p-4 w-full">
              <div className="space-y-2">
                <div className="h-1.5 w-3/4 bg-gray-100 rounded-full"></div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full"></div>
                
                <div className="flex gap-3 py-2">
                  <div className="w-0.5 bg-brand-primary rounded-full shrink-0"></div>
                  <p className="text-text-main font-serif text-sm leading-tight">
                    The true power of a digital sanctuary lies in what it gently takes away.
                  </p>
                </div>

                <div className="h-1.5 w-full bg-gray-100 rounded-full"></div>
              </div>
            </div>
          </FeatureCard>

          {/* The Art of Reading */}
          <FeatureCard
            title="The Art of Reading"
            description="Bionic reading models."
            icon={<BookText className="text-brand-primary w-5 h-5" />}
          >
            <div className="bg-[#F2F1EF] rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[8px] font-bold tracking-widest uppercase text-text-muted">Pacing</span>
                <span className="text-[10px] font-bold">350 WPM</span>
              </div>
              <div className="h-1.5 w-full bg-gray-300 rounded-full overflow-hidden">
                <div className="h-full bg-brand-primary w-3/5 rounded-full"></div>
              </div>
            </div>
          </FeatureCard>

          {/* Intelligence Partner */}
          <FeatureCard
            title="Your Intelligence Partner"
            description="Subtle sidebar companion."
          >
            <div className="flex flex-col gap-2">
              <div className="bg-white border border-border-subtle rounded-lg p-3 flex gap-2 shadow-sm">
                <Zap className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                <p className="text-[10px] text-text-main leading-tight">
                  Strengthen transitions.
                </p>
              </div>
              <div className="bg-brand-primary text-white rounded-lg p-2 text-center text-[10px] font-bold shadow-sm cursor-pointer hover:bg-brand-highlight">
                Apply suggestion
              </div>
            </div>
          </FeatureCard>

          {/* Watch Your Garden Thrive */}
          <FeatureCard
            title="Watch Your Garden Thrive"
            description="Visualize your habits."
            className="md:col-span-2"
            badge={
              <div className="bg-white border border-border-subtle rounded-full px-2 py-0.5 flex items-center gap-1 shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div>
                <span className="text-[8px] font-bold">14 Day Streak</span>
              </div>
            }
          >
            <div className="flex items-end gap-2 h-20 w-full md:w-1/2 ml-auto">
              <div className="flex-1 bg-chart-1 rounded-t h-[20%] transition-all duration-500 group-hover:h-[25%]"></div>
              <div className="flex-1 bg-chart-2 rounded-t h-[30%] transition-all duration-500 group-hover:h-[35%]"></div>
              <div className="flex-1 bg-chart-3 rounded-t h-[15%] transition-all duration-500 group-hover:h-[20%]"></div>
              <div className="flex-1 bg-chart-4 rounded-t h-[45%] transition-all duration-500 group-hover:h-[50%]"></div>
              <div className="flex-1 bg-chart-5 rounded-t h-[65%] transition-all duration-500 group-hover:h-[70%]"></div>
              <div className="flex-1 bg-chart-6 rounded-t h-[95%] shadow-sm"></div>
              <div className="flex-1 bg-chart-7 rounded-t h-[25%] transition-all duration-500 group-hover:h-[30%]"></div>
            </div>
          </FeatureCard>

        </div>
      </section>
    </div>
  );
};