
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import SideNavbar from "../components/SideNavbar";
import RecipeCard from "../components/RecipeCard";
import { supabase } from "../lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

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

const Home = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .order('likes', { ascending: false });
          
        if (error) throw error;
        
        setRecipes(data as Recipe[]);
        setFilteredRecipes(data as Recipe[]);
      } catch (error) {
        console.error('Error fetching recipes:', error);
        toast({
          title: "Error",
          description: "Failed to load recipes. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecipes();
    
    const recipesSubscription = supabase
      .channel('recipes_home_updates')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'recipes' }, 
        (payload) => {
          console.log('Recipe updated:', payload);
          setRecipes(currentRecipes => 
            currentRecipes.map(recipe => 
              recipe.id === payload.new.id 
                ? { ...recipe, likes: payload.new.likes, dislikes: payload.new.dislikes } 
                : recipe
            )
          );
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(recipesSubscription);
    };
  }, [toast]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredRecipes(recipes);
    } else {
      const lowercaseQuery = searchQuery.toLowerCase();
      const filtered = recipes.filter(recipe => 
        recipe.title.toLowerCase().includes(lowercaseQuery)
      );
      setFilteredRecipes(filtered);
    }
  }, [searchQuery, recipes]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideNavbar />
      
      <div className="ml-16 md:ml-64 flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <header className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Hello, <span className="text-[#F97316]">{user?.user_metadata?.username || 'there'}</span>
            </h1>
            <p className="text-gray-600">What would you like to cook today?</p>
          </header>

          <div className="mb-6">
            <div className="relative">
              <Input 
                type="text"
                placeholder="Search recipes by name..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Search size={18} />
              </div>
            </div>
          </div>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              {searchQuery.trim() ? 'Search Results' : 'All Recipes'}
            </h2>
            
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#F97316]"></div>
              </div>
            ) : filteredRecipes.length > 0 ? (
              <div>
                {filteredRecipes.map((recipe) => (
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
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No recipes found matching "{searchQuery}"</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Home;
