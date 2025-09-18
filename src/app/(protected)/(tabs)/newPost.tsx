import { View, Text, Button, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { CameraView, CameraType, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/useAuthStore';
import * as FileSystem from 'expo-file-system'
import { createPost, uploadVideoToStorage } from '@/services/posts';

export default function NewPostScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [video, setVideo] = useState<string>();
  const [description, setDescription] = useState<string>('');
  const user = useAuthStore((state) => state.user);

  const cameraRef = useRef<CameraView>(null);
  const queryClient = useQueryClient();

  const [permission, requestPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  const videoPlayer = useVideoPlayer(null, (player) => {
    player.loop = true;
  })

  const { mutate: createNewPost, isPending } = useMutation({
    mutationFn: async ({ video, description }: { video: string; description: string }) => {
      const fileExtension = video.split('.').pop() || 'mp4';
      const fileName = `${user?.id}/${Date.now()}.${fileExtension}`

      const file = new FileSystem.File(video);
      const fileBuffer = await file.bytes();

      if (user) {
        const videoUrl = await uploadVideoToStorage({ fileName, fileExtension, fileBuffer });
        await createPost({ video_url: videoUrl, description, user_id: user?.id })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts']});
      videoPlayer.release();
      setDescription('');
      setVideo('');
      router.replace('/');
    },
    onError: () => {
      Alert.alert('Error', 'Something went wrong. Try again!')
    }
  })

  useEffect(() => {
    (async () => {
      if (permission && !permission.granted && permission.canAskAgain) {
        await requestPermission();
      }

      if (micPermission && !micPermission.granted && micPermission.canAskAgain) {
        await requestMicPermission();
      }
    })();
  }, [permission, micPermission])

  if (!permission || !micPermission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if ((permission && !permission.granted && !permission.canAskAgain) || (micPermission && !micPermission.granted && !micPermission.canAskAgain)) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>We need your permission to use the camera and microphone</Text>
        <Button title='Grant Permission' onPress={() => Linking.openSettings()} />
      </View>
    )
  }

  const toggleCameraFacing = () => setFacing(current => (current === 'back' ? 'front' : 'back'));

  const selectFromGallery = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: true,
      aspect: [9, 16],
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri
      setVideo(uri);
      await videoPlayer.replaceAsync(uri);
      videoPlayer.play();
    }
  };

  const dismissVideo = () => {
    setVideo(undefined);
    videoPlayer.release()
  };

  const postVideo = () => {
    if (!video) {
      Alert.alert('Error', 'No Video Selected');
      return;
    }
    createNewPost({ video, description });
  };

  const stopRecording = () => {
    setIsRecording(false);
    cameraRef.current?.stopRecording();
  };

  const startRecording = async () => {
    setIsRecording(true);
    const recordedVideo = await cameraRef.current?.recordAsync();
    if (recordedVideo?.uri) {
      const uri = recordedVideo.uri
      setVideo(uri)
      await videoPlayer.replaceAsync({ uri })
      videoPlayer.play();
    }
  };

  const renderCamera = () => {
    return (
      <View style={{ flex: 1 }}>
        <CameraView mode='video' ref={cameraRef} style={{ flex: 1 }} facing={facing} />
        <View style={styles.tobBar}>
          <Ionicons name="close" size={40} color="white" onPress={() => router.back()} />
        </View>

        <View style={styles.bottomControls}>
          <Ionicons name="images" size={40} color="white" onPress={(selectFromGallery)} />

          <TouchableOpacity
            style={[
              styles.recordButton,
              isRecording && styles.recordingButton,
            ]}
            onPress={isRecording ? stopRecording : startRecording}
          />

          <Ionicons name="camera-reverse" size={40} color="white" onPress={toggleCameraFacing} />
        </View>
      </View>
    )
  };

  const renderRecorderVideo = () => {
    return (
      <View style={{ flex: 1 }}>
        <Ionicons
          name="close"
          size={32}
          color="white"
          onPress={dismissVideo}
          style={styles.closeIcon}
        />

        <View style={styles.videoWrapper}>
          <VideoView
            player={videoPlayer}
            contentFit='cover'
            style={styles.video}
          />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.descriptionContainer}
          keyboardVerticalOffset={20}
        >
          <TextInput
            style={styles.input}
            placeholder="Add a description..."
            placeholderTextColor="#aaa"
            multiline
            value={description}
            onChangeText={setDescription}
          />
          <TouchableOpacity
            style={styles.postButton}
            onPress={postVideo}
          >
            <Text style={styles.postText}>Post</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
    )
  };

  return (
    <>
      {video ? renderRecorderVideo() : renderCamera()}
    </>
  );
}

const styles = StyleSheet.create({
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20
  },
  permissionText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700'
  },
  recordButton: {
    width: 80,
    height: 80,
    backgroundColor: '#fff',
    borderRadius: 40
  },
  recordingButton: {
    backgroundColor: '#F44336'
  },
  tobBar: {
    position: 'absolute',
    top: 55,
    left: 15
  },
  bottomControls: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%'
  },
  closeIcon: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1
  },
  video: {
    aspectRatio: 9 / 16
  },
  input: {
    flex: 1,
    color: 'white',
    backgroundColor: '#111',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 10,
    maxHeight: 110
  },
  postText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700'
  },
  postButton: {
    backgroundColor: '#FF0050',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
  },
  videoWrapper: {
    flex: 1
  },
  descriptionContainer: {
    paddingHorizontal: 5,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15
  }
});