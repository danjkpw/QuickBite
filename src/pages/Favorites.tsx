
import React, { useEffect, useState } from "react";
import SideNavbar from "../components/SideNavbar";
import { supabase } from "../lib/supabase";
import RecipeCard from "../components/RecipeCard";
import { useToast } from "@/hooks/use-toast";

interface Recipe {
  id: number;
  title: string;
  image_url: string;
  cuisine: string;
  cook_time: string;
  ingredients: string[];
  instructions: string;
  likes: number;
  dislikes: number;
}

const Favorites = () => {
  const [topRecipes, setTopRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTopRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('likes', { ascending: false })
        .limit(3);
        
      if (error) throw error;
      
      setTopRecipes(data as Recipe[]);
    } catch (error) {
      console.error('Error fetching top recipes:', error);
      toast({
        title: "Error",
        description: "Failed to load top recipes. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopRecipes();
    const recipesSubscription = supabase
      .channel('public:recipes')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'recipes' }, 
        (payload) => {
          console.log('Recipe updated in Favorites:', payload);
          
          setTopRecipes(currentRecipes => 
            currentRecipes.map(recipe => 
              recipe.id === payload.new.id 
                ? { ...recipe, likes: payload.new.likes } 
                : recipe
            )
          );
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(recipesSubscription);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideNavbar />
      
      <div className="ml-16 md:ml-64 flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Top 3 Hot Recipes</h1>
            <p className="text-gray-600">The most liked recipes by our community</p>
          </header>

          <section>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#F97316]"></div>
              </div>
            ) : (
              <div>
                {topRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    id={recipe.id}
                    title={recipe.title}
                    image={recipe.image_url}
                    cuisine={recipe.cuisine}
                    cookTime={recipe.cook_time}
                    ingredients={recipe.ingredients}
                    instructions={recipe.instructions}
                    likes={recipe.likes}
                    dislikes={recipe.dislikes}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Favorites;
