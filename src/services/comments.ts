import { supabase } from "@/lib/supabase"
import { NewCommentInput } from "@/types/types";

export const fetchCommentsById = async (postId: string) => {
  const { data } = await supabase
    .from('comments')
    .select('*, user:profiles(*)') 
    .eq('post_id', postId)
    .order('id', { ascending: true })
    .throwOnError()

  return data;
}

export const createComment = async (newComment: NewCommentInput) => {
  const { data } = await supabase
    .from('comments')
    .insert(newComment)
    .throwOnError()

  return data;
}