
import React, { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface RecipeCardProps {
  id: number;
  title: string;
  image: string;
  cuisine: string;
  cookTime: string;
  ingredients: string[];
  instructions: string;
  likes: number;
  dislikes?: number;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ 
  id, 
  title, 
  image, 
  cuisine, 
  cookTime, 
  ingredients, 
  instructions,
  likes: initialLikes,
  dislikes: initialDislikes = 0
}) => {
  const [expanded, setExpanded] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [dislikeCount, setDislikeCount] = useState(initialDislikes);
  const [userFeedback, setUserFeedback] = useState<"like" | "dislike" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    setLikeCount(initialLikes);
    setDislikeCount(initialDislikes || 0);
  }, [initialLikes, initialDislikes]);

  useEffect(() => {
    const checkUserFeedback = async () => {
      if (!user) {
        setUserFeedback(null);
        return;
      }
      
      try {
        const { data: likeData } = await supabase
          .from('recipe_likes')
          .select('*')
          .eq('user_id', user.id)
          .eq('recipe_id', id)
          .single();
          
        if (likeData) {
          setUserFeedback("like");
          return;
        }
        
        // Check if user has disliked the recipe
        const { data: dislikeData } = await supabase
          .from('recipe_dislikes')
          .select('*')
          .eq('user_id', user.id)
          .eq('recipe_id', id)
          .single();
          
        if (dislikeData) {
          setUserFeedback("dislike");
          return;
        }
        
        setUserFeedback(null);
      } catch (error) {
        console.error("Error checking user feedback:", error);
        setUserFeedback(null);
      }
    };
    
    checkUserFeedback();
  }, [id, user]);

  const handleFeedback = async (feedbackType: "like" | "dislike") => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to rate recipes",
        variant: "destructive",
      });
      return;
    }

    if (isProcessing) return;
    setIsProcessing(true);
    
    try {
      if (feedbackType === "like") {
        if (userFeedback === "like") {
          const newLikeCount = Math.max(0, likeCount - 1);
          
          const { error: updateError } = await supabase
            .from('recipes')
            .update({ likes: newLikeCount })
            .eq('id', id);
            
          if (updateError) throw updateError;
          
          const { error: deleteError } = await supabase
            .from('recipe_likes')
            .delete()
            .eq('user_id', user.id)
            .eq('recipe_id', id);
            
          if (deleteError) throw deleteError;
            
          setUserFeedback(null);
          setLikeCount(newLikeCount);
        } else {
          if (userFeedback === "dislike") {
            const newDislikeCount = Math.max(0, dislikeCount - 1);
            
            const { error: updateDislikeError } = await supabase
              .from('recipes')
              .update({ dislikes: newDislikeCount })
              .eq('id', id);
              
            if (updateDislikeError) throw updateDislikeError;
            
            const { error: deleteDislikeError } = await supabase
              .from('recipe_dislikes')
              .delete()
              .eq('user_id', user.id)
              .eq('recipe_id', id);
              
            if (deleteDislikeError) throw deleteDislikeError;
            
            setDislikeCount(newDislikeCount);
          }
          
          const newLikeCount = likeCount + 1;
          
          const { error: updateError } = await supabase
            .from('recipes')
            .update({ likes: newLikeCount })
            .eq('id', id);
            
          if (updateError) throw updateError;
          
          const { error: insertError } = await supabase
            .from('recipe_likes')
            .upsert([
              { user_id: user.id, recipe_id: id, like_status: true }
            ]);
          
          if (insertError) throw insertError;
          
          setUserFeedback("like");
          setLikeCount(newLikeCount);
        }
      } 
      else if (feedbackType === "dislike") {
        if (userFeedback === "dislike") {
          const newDislikeCount = Math.max(0, dislikeCount - 1);
          
          const { error: updateError } = await supabase
            .from('recipes')
            .update({ dislikes: newDislikeCount })
            .eq('id', id);
            
          if (updateError) throw updateError;
          
          const { error: deleteError } = await supabase
            .from('recipe_dislikes')
            .delete()
            .eq('user_id', user.id)
            .eq('recipe_id', id);
            
          if (deleteError) throw deleteError;
            
          setUserFeedback(null);
          setDislikeCount(newDislikeCount);
        } else {
          if (userFeedback === "like") {
            const newLikeCount = Math.max(0, likeCount - 1);
            
            const { error: updateLikeError } = await supabase
              .from('recipes')
              .update({ likes: newLikeCount })
              .eq('id', id);
              
            if (updateLikeError) throw updateLikeError;
            
            const { error: deleteLikeError } = await supabase
              .from('recipe_likes')
              .delete()
              .eq('user_id', user.id)
              .eq('recipe_id', id);
              
            if (deleteLikeError) throw deleteLikeError;
            
            setLikeCount(newLikeCount);
          }
          
          const newDislikeCount = dislikeCount + 1;
          
          const { error: updateError } = await supabase
            .from('recipes')
            .update({ dislikes: newDislikeCount })
            .eq('id', id);
            
          if (updateError) throw updateError;
          
          const { error: insertError } = await supabase
            .from('recipe_dislikes')
            .upsert([
              { user_id: user.id, recipe_id: id, dislike_status: true }
            ]);
          
          if (insertError) throw insertError;
          
          setUserFeedback("dislike");
          setDislikeCount(newDislikeCount);
        }
      }

    } catch (error) {
      console.error("Error updating feedback:", error);
      toast({
        title: "Error",
        description: "Failed to update feedback",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="quickbite-card mb-4">
      <div 
        className="cursor-pointer" 
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center">
          <img 
            src={image} 
            alt={title} 
            className="w-20 h-20 rounded-md object-cover"
          />
          <div className="ml-4 flex-grow">
            <h3 className="font-medium text-lg">{title}</h3>
            <div className="text-sm text-gray-500">
              <span className="mr-2">{cuisine}</span>
              <span>{cookTime}</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center text-sm">
              <span className="text-green-600 font-medium mr-1">{likeCount}</span>
              <ThumbsUp size={16} className="text-green-600" />
            </div>
            <div className="flex items-center text-sm">
              <span className="text-red-500 font-medium mr-1">{dislikeCount}</span>
              <ThumbsDown size={16} className="text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="mt-4">
          <h4 className="font-medium mb-2">Ingredients:</h4>
          <ul className="list-disc pl-5 mb-3">
            {ingredients.map((ingredient, idx) => (
              <li key={idx} className="text-sm">{ingredient}</li>
            ))}
          </ul>

          <h4 className="font-medium mb-2">Instructions:</h4>
          <p className="text-sm">{instructions}</p>

          <div className="flex items-center justify-end mt-4 space-x-3">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleFeedback("like");
              }} 
              className={`p-2 rounded-full ${isProcessing ? "opacity-50" : ""} 
                ${userFeedback === "like" ? "bg-green-100" : "bg-gray-100 hover:bg-gray-200"}`}
              disabled={isProcessing}
              aria-label="Like recipe"
            >
              <ThumbsUp size={18} className={userFeedback === "like" ? "text-green-600" : "text-gray-500"} />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleFeedback("dislike");
              }}
              className={`p-2 rounded-full ${isProcessing ? "opacity-50" : ""} 
                ${userFeedback === "dislike" ? "bg-red-100" : "bg-gray-100 hover:bg-gray-200"}`}
              disabled={isProcessing}
              aria-label="Dislike recipe"
            >
              <ThumbsDown size={18} className={userFeedback === "dislike" ? "text-red-500" : "text-gray-500"} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeCard;
