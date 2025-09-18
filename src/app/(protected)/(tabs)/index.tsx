import { View, FlatList, Dimensions, ViewToken, StyleSheet, ActivityIndicator, Text } from 'react-native';
import PostListItem from '@/components/PostListItem';
import { useMemo, useRef, useState } from 'react';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import FeedTab from '@/components/GenericComponents/FeedTab';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { fetchPosts } from '@/services/posts';

const TABS = {
  EXPLORE: 'Explore',
  FOLLOWING: 'Following',
  FOR_YOU: 'For You'
};

export default function HomeScreen() {
  const { height } = Dimensions.get('window');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState(TABS.FOR_YOU);

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam }) => fetchPosts(pageParam),
    initialPageParam: { limit: 3, cursor: undefined},
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length === 0) {
        return undefined;
      }

      return {
        limit: 3,
        cursor: lastPage[lastPage.length - 1].id,
      }
    }
  })

  const posts = useMemo(() => data?.pages.flat() || [], [data])

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0]?.index || 0)
    }
  })

  if (isLoading) {
    return (
      <ActivityIndicator
        size={"large"}
        style={{ flex: 1, justifyContent: 'center' }}
      />
    )
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={{
          color: '#fff',
          fontWeight: 'bold',
          textAlign: 'center',
          fontSize: 18
        }}>
          Error Occured While Fetchinh The Posts
        </Text>
      </View>
    )
  }

  return (
    <View>
      <View style={styles.topBar}>
        <MaterialIcons name="live-tv" size={24} color="white" />
        <View style={styles.navigationBar}>
          <FeedTab title={TABS.EXPLORE} setActiveTab={setActiveTab} activeTab={activeTab} />
          <FeedTab title={TABS.FOLLOWING} setActiveTab={setActiveTab} activeTab={activeTab} />
          <FeedTab title={TABS.FOR_YOU} setActiveTab={setActiveTab} activeTab={activeTab} />
        </View>
        <Ionicons name="search" size={24} color="white" />
      </View>

      <FlatList
        data={posts}
        renderItem={({ item, index }) => (
          <PostListItem postItem={item} isActive={index === currentIndex} />
        )}
        getItemLayout={(data, index) => ({
          length: height - 80,
          offset: (height - 80) * index,
          index
        })}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
        showsVerticalScrollIndicator={false}
        snapToInterval={height - 80}
        decelerationRate={"fast"}
        disableIntervalMomentum
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        onEndReached={() => !isFetchingNextPage && hasNextPage && fetchNextPage()}
        onEndReachedThreshold={2}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  navigationBar: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    gap: 30
  },
  topBar: {
    flexDirection: 'row',
    position: 'absolute',
    top: 70,
    zIndex: 1,
    paddingHorizontal: 15
  }
})