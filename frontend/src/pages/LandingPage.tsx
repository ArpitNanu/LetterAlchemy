import { BookOpen, Sparkles, BookText, Zap, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FeatureCard } from "@/components/ui/FeatureCard";

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-text-main font-sans selection:bg-brand-primary/20 overflow-y-auto flex flex-col pb-10">
      
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-6 md:px-8 py-4 max-w-6xl mx-auto w-full shrink-0">
        <div className="flex items-center gap-2 font-bold text-lg cursor-pointer" onClick={() => navigate("/")}>
          <BookOpen className="text-brand-primary w-4 h-4" />
          LetterAlchemy
        </div>

        <div className="flex items-center gap-3 md:gap-4 text-sm font-medium">
          <button onClick={() => navigate("/login")} className="hover:text-brand-primary transition-colors px-2">Sign In</button>
          <button onClick={() => navigate("/signup")} className="bg-brand-primary text-white px-5 py-2 rounded-full hover:bg-brand-highlight transition-colors shadow-sm">
            Get Started
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="max-w-6xl mx-auto px-6 pt-10 md:pt-16 pb-12 text-center flex flex-col items-center shrink-0">
        <div className="inline-flex items-center gap-2 bg-[#F1F3F0] text-text-muted text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-6">
          <Sparkles className="w-2.5 h-2.5 text-brand-primary" /> Introducing LetterAlchemy 2.0
        </div>
        
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-4xl mx-auto leading-[1.1]">
          The Sanctuary for <br /> <span className="text-brand-primary">Digital Alchemy.</span>
        </h1>
        
        <p className="text-text-muted text-sm md:text-lg max-w-xl mx-auto mb-10 leading-relaxed px-4">
          Experience the perfect harmony of undisturbed focus and intelligent assistance. Transform fragmented thoughts into structured brilliance.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto px-6 sm:px-0">
          <button onClick={() => navigate("/editor/new")} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-primary text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-brand-highlight transition-all shadow-md">
            Start Writing <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => navigate("/home")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-border-subtle text-text-main px-8 py-3 rounded-full text-sm font-medium hover:border-brand-primary transition-all shadow-sm"
          >
            Explore the Grid
          </button>
        </div>
      </main>

      {/* BENTO GRID FEATURES SECTION */}
      <section className="max-w-6xl mx-auto px-6 pb-12 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Write in the Flow */}
          <FeatureCard
            title="Write in the Flow"
            description="Focus Mode blurs distractions."
            className="md:col-span-2"
          >
            <div className="bg-white rounded-xl shadow-sm border border-border-subtle p-6 w-full h-full min-h-[160px]">
              <div className="space-y-3">
                <div className="h-2 w-3/4 bg-gray-100 rounded-full"></div>
                <div className="h-2 w-full bg-gray-100 rounded-full"></div>
                
                <div className="flex gap-4 py-2">
                  <div className="w-1 bg-brand-primary rounded-full shrink-0"></div>
                  <p className="text-text-main font-serif text-base leading-snug">
                    The true power of a digital sanctuary lies in what it gently takes away.
                  </p>
                </div>

                <div className="h-2 w-full bg-gray-100 rounded-full"></div>
              </div>
            </div>
          </FeatureCard>

          {/* The Art of Reading */}
          <FeatureCard
            title="The Art of Reading"
            description="Bionic reading models."
            icon={<BookText className="text-brand-primary w-5 h-5" />}
          >
            <div className="bg-[#F2F1EF] rounded-xl p-6 h-full flex flex-col justify-center">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold tracking-widest uppercase text-text-muted">Pacing</span>
                <span className="text-xs font-bold">350 WPM</span>
              </div>
              <div className="h-2 w-full bg-gray-300 rounded-full overflow-hidden">
                <div className="h-full bg-brand-primary w-3/5 rounded-full"></div>
              </div>
            </div>
          </FeatureCard>

          {/* Intelligence Partner */}
          <FeatureCard
            title="Your Intelligence Partner"
            description="Subtle sidebar companion."
          >
            <div className="flex flex-col gap-3 h-full justify-center">
              <div className="bg-white border border-border-subtle rounded-xl p-4 flex gap-3 shadow-sm">
                <Zap className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                <p className="text-xs text-text-main leading-relaxed">
                  Strengthen transitions.
                </p>
              </div>
              <div className="bg-brand-primary text-white rounded-xl p-3 text-center text-xs font-bold shadow-md cursor-pointer hover:bg-brand-highlight transition-colors">
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
              <div className="bg-white border border-border-subtle rounded-full px-3 py-1 flex items-center gap-2 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse"></div>
                <span className="text-[10px] font-bold uppercase tracking-wider">14 Day Streak</span>
              </div>
            }
          >
            <div className="flex items-end gap-3 h-24 w-full md:w-3/5 ml-auto mt-4">
              <div className="flex-1 bg-chart-1 rounded-t-lg h-[20%] transition-all duration-500 group-hover:h-[30%]"></div>
              <div className="flex-1 bg-chart-2 rounded-t-lg h-[35%] transition-all duration-500 group-hover:h-[45%]"></div>
              <div className="flex-1 bg-chart-3 rounded-t-lg h-[15%] transition-all duration-500 group-hover:h-[25%]"></div>
              <div className="flex-1 bg-chart-4 rounded-t-lg h-[50%] transition-all duration-500 group-hover:h-[60%]"></div>
              <div className="flex-1 bg-chart-5 rounded-t-lg h-[70%] transition-all duration-500 group-hover:h-[80%]"></div>
              <div className="flex-1 bg-chart-6 rounded-t-lg h-[95%] shadow-lg"></div>
              <div className="flex-1 bg-chart-7 rounded-t-lg h-[30%] transition-all duration-500 group-hover:h-[40%]"></div>
            </div>
          </FeatureCard>

        </div>
      </section>
    </div>
  );
};