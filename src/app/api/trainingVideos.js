import { supabase } from "../../data/supabaseClient";

export const getTrainingVideos = async (userCategory) => {
  try {
    const { data, error } = await supabase
      .schema('onlyclick')
      .from("trainingvideos")
      .select("*")
      .or(`category.eq.All,category.eq.${userCategory}`);

    return data || [];

  } catch (error) {
    console.error("Error fetching training videos:", error);
    throw error;
  }
};

