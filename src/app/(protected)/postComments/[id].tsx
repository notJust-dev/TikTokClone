import { createComment, fetchCommentsById } from "@/services/comments";
import { useAuthStore } from "@/stores/useAuthStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function PostComments() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [commentText, setCommentText] = useState<string>('');
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', id],
    queryFn: () => fetchCommentsById(id),
    enabled: !!id
  });

  const { mutate: addComment, isPending } = useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', id] })
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      setCommentText('');
    },
    onError: () => {
      Alert.alert('Error', 'Unexpected Error Occured')
    }
  })

  const addNewComment = () => {
    if (!id || !user || !commentText.trim()) return;
    addComment({ post_id: id, user_id: user?.id, comment: commentText.trim() })
  }

  return (
    <View style={{ flex: 1, padding: 15, gap: 20 }}>
      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={comments || []}
          renderItem={({ item }) => (
            <View>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{item.user.username}</Text>
              <Text style={{ color: '#fff' }}>{item.comment}</Text>
            </View>
          )}
          contentContainerStyle={{ gap: 10 }}
        />
      )}

      <View style={{ marginBottom: 20 }}>
        <TextInput
          placeholder="Add a comment..."
          value={commentText}
          onChangeText={setCommentText}
          placeholderTextColor="gray"
          style={{
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 5,
            padding: 10,
            color: '#fff'
          }}
          editable={!isPending}
        />

        <TouchableOpacity style={{
          backgroundColor: '#FF0050',
          paddingHorizontal: 15,
          paddingVertical: 10,
          borderRadius: 10,
          marginTop: 10
        }}
          onPress={addNewComment}
          disabled={isPending || !commentText.trim()}
        >
          <Text style={{
            fontSize: 19,
            fontWeight: 'bold',
            color: '#fff',
            textAlign: 'center'
          }}>
            {isPending ? 'Posting...' : 'Post'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}