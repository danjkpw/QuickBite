
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import RecipeCard from "../components/RecipeCard";
import SideNavbar from "../components/SideNavbar";
import { Search as SearchIcon, Plus, X } from "lucide-react";

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

const Search = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState("");
  const [cuisineType, setCuisineType] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleAddIngredient = () => {
    if (currentIngredient.trim() && !ingredients.includes(currentIngredient.trim())) {
      setIngredients([...ingredients, currentIngredient.trim()]);
      setCurrentIngredient("");
    }
  };

  const handleRemoveIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter(i => i !== ingredient));
  };

  const handleSearch = async () => {
    if (!ingredients.length && !cuisineType) return;
    
    setLoading(true);
    setSearched(true);
    
    try {
      let query = supabase.from('recipes').select('*');
      if (cuisineType) {
        query = query.ilike('cuisine', `%${cuisineType}%`);
      }
      
      let { data, error } = await query;
      if (error) throw error;
      if (ingredients.length > 0 && data) {
        data = data.filter(recipe => {
          return ingredients.every(ingredient => 
            recipe.ingredients.some(recipeIng => 
              recipeIng.toLowerCase().includes(ingredient.toLowerCase())
            )
          );
        });
      }
      if (user) {
        await supabase.from('search_history').insert([{
          user_id: user.id,
          cuisine_type: cuisineType,
          ingredients: ingredients,
        }]);
      }
      
      setRecipes(data as Recipe[] || []);
    } catch (error) {
      console.error('Error searching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddIngredient();
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideNavbar />
      
      <div className="ml-16 md:ml-64 flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Search Recipes</h1>
            <p className="text-gray-600">Find recipes by ingredients or cuisine</p>
          </header>

          <div className="quickbite-card mb-8">
            <div className="mb-4">
              <label htmlFor="cuisine" className="block text-sm font-medium text-gray-700 mb-1">
                Cuisine Type
              </label>
              <input
                type="text"
                id="cuisine"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                placeholder="Italian, Asian, Mexican..."
                value={cuisineType}
                onChange={(e) => setCuisineType(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ingredients
              </label>
              <div className="flex">
                <input
                  type="text"
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  placeholder="Add ingredients..."
                  value={currentIngredient}
                  onChange={(e) => setCurrentIngredient(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button 
                  onClick={handleAddIngredient}
                  className="flex items-center justify-center px-3 bg-[#F97316] text-white rounded-r-md"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            {ingredients.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {ingredients.map((ingredient, index) => (
                  <div 
                    key={index} 
                    className="flex items-center bg-gray-200 px-2 py-1 rounded-full text-sm"
                  >
                    <span>{ingredient}</span>
                    <button 
                      onClick={() => handleRemoveIngredient(ingredient)} 
                      className="ml-1 text-gray-600 hover:text-gray-900"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleSearch}
              disabled={loading || (!ingredients.length && !cuisineType)}
              className="w-full flex items-center justify-center py-2 bg-[#F97316] text-white rounded-md hover:bg-[#f97316e6] disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <SearchIcon size={18} className="mr-2" />
                  Search Recipes
                </>
              )}
            </button>
          </div>

          {searched && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                {loading ? 'Searching...' : 
                  recipes.length > 0 ? `Found ${recipes.length} recipes` : 'No recipes found'}
              </h2>
              
              {!loading && recipes.map((recipe) => (
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
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
