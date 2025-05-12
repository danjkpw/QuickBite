import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import SideNavbar from "../components/SideNavbar";
import { useToast } from "@/hooks/use-toast";

interface SearchHistoryItem {
  id: number;
  cuisine_type: string;
  ingredients: string[];
  created_at: string;
}

interface Recipe {
  id: number;
  title: string;
  image_url: string;
  cuisine: string;
  cook_time: string;
  ingredients: string[];
  instructions: string;
  likes: number;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [likedRecipes, setLikedRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchLikedRecipes = async () => {
    if (!user) return;
    
    try {
      // Fetch liked recipes (only where like_status is true)
      const { data: likesData, error: likesError } = await supabase
        .from('recipe_likes')
        .select('recipe_id')
        .eq('user_id', user.id)
        .eq('like_status', true);
        
      if (likesError) throw likesError;
      
      if (likesData && likesData.length > 0) {
        const recipeIds = likesData.map(like => like.recipe_id);
        
        const { data: recipesData, error: recipesError } = await supabase
          .from('recipes')
          .select('*')
          .in('id', recipeIds);
          
        if (recipesError) throw recipesError;
        setLikedRecipes(recipesData as Recipe[] || []);
      } else {
        setLikedRecipes([]);
      }
    } catch (error) {
      console.error("Error fetching liked recipes:", error);
      toast({
        title: "Error",
        description: "Failed to load liked recipes.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const { data: historyData, error: historyError } = await supabase
          .from('search_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (historyError) throw historyError;
        setSearchHistory(historyData as SearchHistoryItem[] || []);
        
        await fetchLikedRecipes();
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    
    const likesSubscription = supabase
      .channel('recipe_likes_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'recipe_likes', filter: `user_id=eq.${user?.id}` }, 
        (payload) => {
          console.log('Recipe likes updated:', payload);
          fetchLikedRecipes();
        }
      )
      .subscribe();
      
    const recipesSubscription = supabase
      .channel('recipes_changes')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'recipes' },
        (payload) => {
          console.log('Recipe updated:', payload);
          setLikedRecipes(prev => 
            prev.map(recipe => 
              recipe.id === payload.new.id
                ? { ...recipe, likes: payload.new.likes }
                : recipe
            )
          );
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(likesSubscription);
      supabase.removeChannel(recipesSubscription);
    };
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
      toast({
        title: "Signed out",
        description: "You've been successfully logged out.",
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "An error occurred while signing out.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideNavbar />
      
      <div className="ml-16 md:ml-64 flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
            <p className="text-gray-600">Manage your account and view activity</p>
          </header>

          <div className="quickbite-card mb-6">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-[#F97316] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user?.user_metadata?.username ? user.user_metadata.username.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="ml-4">
                <h2 className="font-semibold text-lg">
                  {user?.user_metadata?.username || "User"}
                </h2>
                <p className="text-gray-500 text-sm">{user?.email}</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <button
                onClick={handleSignOut}
                className="py-2 px-4 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Liked Recipes</h2>
            
            {loading ? (
              <p className="text-center py-4 text-gray-500">Loading...</p>
            ) : likedRecipes.length > 0 ? (
              <div className="quickbite-card">
                <ul className="divide-y divide-gray-200">
                  {likedRecipes.map((recipe) => (
                    <li key={recipe.id} className="py-3 hover:bg-gray-50 cursor-pointer transition">
                      <div className="flex items-center">
                        <img 
                          src={recipe.image_url} 
                          alt={recipe.title} 
                          className="w-12 h-12 rounded-md object-cover"
                        />
                        <div className="ml-3">
                          <h3 className="font-medium">{recipe.title}</h3>
                          <p className="text-sm text-gray-500">{recipe.cuisine} • {recipe.cook_time}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-center py-4 text-gray-500">No liked recipes yet.</p>
            )}
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Search History</h2>
            
            {loading ? (
              <p className="text-center py-4 text-gray-500">Loading...</p>
            ) : searchHistory.length > 0 ? (
              <div className="quickbite-card">
                <ul className="divide-y divide-gray-200">
                  {searchHistory.map((item) => (
                    <li key={item.id} className="py-3">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-500">
                          {formatDate(item.created_at)}
                        </span>
                        <span className="font-medium">
                          {item.cuisine_type || "Any cuisine"}
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.ingredients.map((ing, idx) => (
                            <span 
                              key={idx}
                              className="px-2 py-0.5 bg-gray-200 rounded-full text-xs"
                            >
                              {ing}
                            </span>
                          ))}
                          {item.ingredients.length === 0 && (
                            <span className="text-sm text-gray-500">No ingredients specified</span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-center py-4 text-gray-500">No search history yet.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Profile;
