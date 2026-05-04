import { useEffect, useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { Pencil, FileText, CheckCircle, BookOpen, LogOut, Sun, Moon, Camera, Loader2, X, Check, Link } from "lucide-react";
import apiClient from "@/lib/api"; // Your configured axios instance
import axios from "axios"; // Used for direct R2 upload to avoid baseURL
import { useNavigate } from "react-router-dom";
import { updateUserBio } from "@/api/UserApi";


export const Profile = () => {
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme(); // 🎓 Our custom hook — gives us isDark (boolean) and toggle (function)
  
  // 1. STATE: We create state variables to hold our backend data
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // --- Bio edit state ---
  const [isEditingBio, setIsEditingBio] = useState(false);  // toggles view ↔ edit mode
  const [bioDraft, setBioDraft] = useState("");             // holds "work in progress" text
  const [isSavingBio, setIsSavingBio] = useState(false);   // shows spinner on Save button
  const [bioError, setBioError] = useState<string | null>(null); // surfaces save failures

  // 2. DATA FETCHING: We use useEffect to fetch the data EXACTLY ONCE when the page loads
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Calling our newly built backend route!
        const res = await apiClient.get("/users/profile");
        if (res.data.success) {
          setProfileData(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // 3. LOGIC: Handling the Sign Out (clears token and redirects to login)
  const handleSignOut = () => {
    localStorage.removeItem("token"); // Destroy the JWT token locally
    navigate("/login"); // Send the user back to the login screen
  };

  // --- 🎨 UPLOAD LOGIC ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic Validation: Check if it's an image and size < 5MB
    if (!file.type.startsWith("image/")) return alert("Please upload an image file.");
    if (file.size > 5 * 1024 * 1024) return alert("File is too large. Max 5MB.");

    try {
      setIsUploading(true);

      // 1. Get the "Ticket" (Presigned URL) from our backend
      const { data } = await apiClient.post("/users/upload-url", {
        contentType: file.type,
        fileName: file.name,
      });

      if (!data.success) throw new Error("Failed to get upload URL");

      // 2. Upload directly to Cloudflare R2
      // We use 'axios' instead of 'apiClient' here because we don't want to use our /api base URL
      await axios.put(data.uploadUrl, file, {
        headers: { "Content-Type": file.type },
      });

      // 3. Notify our backend to save the new URL in the database
      const updateRes = await apiClient.post("/users/update-avatar", {
        avatarUrl: data.publicUrl,
      });

      if (updateRes.data.success) {
        // 4. Update the local UI state immediately
        setProfileData((prev: any) => ({
          ...prev,
          profile: { ...prev.profile, avatar: data.publicUrl },
        }));
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // 4. LOADING STATE: Show something nice while we wait for the backend
  if (loading) {
    return <div className="p-8 text-text-muted animate-pulse font-serif">Loading your sanctuary...</div>;
  }

  if (!profileData) {
    return <div className="p-8 text-red-500">Failed to load profile.</div>;
  }

  // Destructure for cleaner code below
  const { profile, stats } = profileData;

  // 5. UI LAYER: This uses CSS Grid to perfectly match your Figma layout
  return (
    <div className="p-8 md:p-12 max-w-6xl mx-auto h-full overflow-y-auto">
      {/* HEADER AREA */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-text-primary mb-2">Profile</h1>
        <p className="text-text-muted font-serif italic">
          View your information, viewing preferences, and account statistics in your digital sanctuary.
        </p>
      </div>

      {/* CSS GRID LAYOUT: 1 column on mobile, 2 columns on desktop (2fr / 1fr ratio like Figma) */}
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8">
        
        {/* LEFT COLUMN: User Info & Preferences */}
        <div className="flex flex-col gap-8">
          
          {/* CARD 1: USER IDENTITY */}
          <div className="bg-surface border border-border-subtle rounded-xl p-6 relative shadow-sm">
            {/* Pencil button — opens bio edit mode */}
            <button
              className="absolute top-6 right-6 text-text-muted hover:text-brand-primary transition-colors"
              title="Edit bio"
              onClick={() => {
                setBioDraft(profile.bio || ""); // seed the draft with current saved bio
                setBioError(null);
                setIsEditingBio(true);
              }}
            >
              <Pencil className="w-5 h-5" />
            </button>
            
            <div className="flex gap-6 items-start ">
              {/* Avatar Section */}
              <div className="relative group shrink-0">
                <div className="w-24 h-24 rounded-lg bg-brand-primary/10 flex items-center justify-center overflow-hidden border border-border-subtle">
                  {profile.avatar ? (
                    <img 
                      src={profile.avatar} 
                      alt="Profile" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <span className="text-3xl font-bold text-brand-primary uppercase">
                      {profile.firstName.charAt(0)}{profile.lastName?.charAt(0)}
                    </span>
                  )}
                  
                  {/* Loading Overlay */}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
                
                {/* Hidden File Input */}
                <input 
                  type="file" 
                  id="avatar-upload" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
                
                {/* Upload Button Overlay */}
                <label 
                  htmlFor="avatar-upload"
                  className="absolute -bottom-2 -right-2 p-2 bg-surface border border-border-subtle rounded-full shadow-md text-text-muted hover:text-brand-primary cursor-pointer transition-all hover:scale-110"
                >
                  <Camera className="w-4 h-4" />
                </label>
              </div>
              
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-text-primary capitalize">
                  {profile.firstName} {profile.lastName}
                </h2>
                <p className="text-text-muted text-sm mb-4">{profile.email}</p>
                
                <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Bio</h3>

                {/* BIO: View mode vs Edit mode */}
                {isEditingBio ? (
                  <div className="mb-4">
                    <textarea
                      value={bioDraft}
                      autoComplete="aria-labelledby"
                      onChange={(e) => setBioDraft(e.target.value)}
                      rows={4}
                      maxLength={300}
                      placeholder="Tell the world about yourself..."
                      className="w-full bg-[var(--color-bg)] border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary font-serif resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition-all"
                    />
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-text-muted">{bioDraft.length}/300</span>
                      <div className="flex gap-2">
                        {/* Cancel — discard draft */}
                        <button
                          onClick={() => { setIsEditingBio(false); setBioError(null); }}
                          className="flex items-center gap-1 px-3 py-1 text-xs text-text-muted border border-border-subtle rounded-full hover:bg-border-subtle transition-colors"
                        >
                          <X className="w-3 h-3" /> Cancel
                        </button>
                        {/* Save — persist to backend */}
                        <button
                          disabled={isSavingBio}
                          onClick={async () => {
                            setIsSavingBio(true);
                            setBioError(null);
                            try {
                              const res = await updateUserBio(bioDraft);
                              if (res.success) {
                                // Commit draft to the main profile state
                                setProfileData((prev: any) => ({
                                  ...prev,
                                  profile: { ...prev.profile, bio: bioDraft },
                                }));
                                setIsEditingBio(false);
                              } else {
                                setBioError("Save failed. Please try again.");
                              }
                            } catch {
                              setBioError("Network error. Please try again.");
                            } finally {
                              setIsSavingBio(false);
                            }
                          }}
                          className="flex items-center gap-1 px-3 py-1 text-xs text-white bg-brand-primary rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                          {isSavingBio ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                          {isSavingBio ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </div>
                    {bioError && <p className="text-red-500 text-xs mt-1">{bioError}</p>}
                  </div>
                ) : (
                  <p className="text-text-primary font-serif mb-4 leading-relaxed">
                    {profile.bio || "No bio written yet. Click the pencil icon to add one."}
                  </p>
                )}

                {/* User website link (replaces hardcoded Architecture / Design tags) */}
                {profile.socialLinks?.website && (
                  <a
                    href={profile.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-brand-primary hover:underline"
                  >
                    <Link className="w-3 h-3" />
                    {profile.socialLinks.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* CARD 2: READING PREFERENCES (Frontend Only UI for now) */}
          <div className="bg-surface border border-border-subtle rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
               Reading Preferences
            </h2>
            
            <div className="border-t border-border-subtle pt-6">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="text-sm font-bold text-text-primary">Interface Theme</h3>
                  <p className="text-xs text-text-muted">Switch between light and dark sanctuary modes.</p>
                </div>
                {/* Theme Toggle — now connected to useTheme hook */}
                <div className="flex bg-brand-surface rounded-full p-1">
                  {/* Light button: gets the white "selected" style when isDark is false */}
                  <button
                    onClick={() => !isDark || toggle()} 
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      !isDark ? "bg-white shadow-sm text-text-primary" : "text-text-muted"
                    }`}
                  >
                    <Sun className="w-3 h-3" /> Light
                  </button>
                  {/* Dark button: gets the white "selected" style when isDark is true */}
                  <button
                    onClick={() => isDark || toggle()}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      isDark ? "bg-white shadow-sm text-text-primary" : "text-text-muted"
                    }`}
                  >
                    <Moon className="w-3 h-3" /> Dark
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Stats & Logout */}
        <div className="flex flex-col gap-8">
          
          {/* CARD 3: ACTIVITY IMPRINT */}
          <div className="bg-surface border border-border-subtle rounded-xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-6">Activity Imprint</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#EEF5F7] rounded-lg p-4 flex flex-col justify-between h-24">
                <CheckCircle className="w-5 h-5 text-brand-primary" />
                <div>
                  <p className="text-2xl font-bold text-text-primary">{stats.published}</p>
                  <p className="text-[10px] text-text-muted uppercase">Published</p>
                </div>
              </div>
              
              <div className="bg-[#EEF5F7] rounded-lg p-4 flex flex-col justify-between h-24">
                <FileText className="w-5 h-5 text-text-muted" />
                <div>
                  <p className="text-2xl font-bold text-text-primary">{stats.drafts}</p>
                  <p className="text-[10px] text-text-muted uppercase">Drafts</p>
                </div>
              </div>
            </div>

            {/* Total Readers Box */}
            <div className="bg-brand-surface rounded-lg p-4 mb-6">
              <div className="flex justify-between items-start mb-2">
                <BookOpen className="w-5 h-5 text-brand-primary" />
                <span className="text-[10px] text-green-600 font-bold bg-green-100 px-2 py-0.5 rounded-full">+5 this week</span>
              </div>
              <p className="text-3xl font-bold text-text-primary">{stats.totalViews.toLocaleString()}</p>
              <p className="text-xs text-text-muted">Total Readers</p>
            </div>
            
            <div className="border-t border-border-subtle pt-4">
              <button className="text-sm font-bold text-brand-primary hover:underline">
                View detailed analytics →
              </button>
            </div>
          </div>

          {/* CARD 4: SIGN OUT BUTTON */}
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-500 bg-red-50 hover:bg-red-100 py-3 rounded-xl font-bold transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};