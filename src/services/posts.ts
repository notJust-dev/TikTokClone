import { supabase } from "@/lib/supabase"
import { PostInput } from "@/types/types";

type StorageInput = {
  fileName: string;
  fileExtension: string;
  fileBuffer: Uint8Array;
};

type Paginationinput = {
  cursor?: string;
  limit?: number;
}

export const fetchPosts = async (pageParams: Paginationinput) => {
  let query = supabase
    .from('posts')
    .select('*, user:profiles(*), nrOfComments:comments(count)')
    .order('id', { ascending: false })

  if (pageParams.limit) {
    query = query.limit(pageParams.limit);
  }

  if (pageParams.cursor) {
    query = query.lt('id', pageParams.cursor);
  }

  const { data } = await query.throwOnError();
  return data;
}

export const uploadVideoToStorage = async (storageProps: StorageInput) => {
  const { fileName, fileExtension, fileBuffer } = storageProps;

  const { data, error } = await supabase.storage
    .from('videos')
    .upload(fileName, fileBuffer, {
      contentType: `video/${fileExtension}`,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('videos')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

export const createPost = async (newPosts: PostInput) => {
  const { data, error } = await supabase
    .from('posts')
    .insert(newPosts)
    .throwOnError()

  return data;
}