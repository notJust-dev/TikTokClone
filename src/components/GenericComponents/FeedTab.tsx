import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

type FeedTabProps = {
  title: string;
  setActiveTab: (title: string) => void;
  activeTab: string;
}

export default function FeedTab({ title, setActiveTab, activeTab }: FeedTabProps) {
  return (
    <TouchableOpacity
      onPress={() => setActiveTab(title)}
      style={styles.tabContainer}
    >
      <Text
        style={[
          styles.tabText,
          activeTab === title && styles.activeTabText
        ]}>
        {title}
      </Text>
      {activeTab === title && <View style={styles.activeDot} />}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  tabContainer: {
    alignItems: 'center'
  },
  tabText: {
    color: 'grey',
    fontSize: 17,
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#fff',
  },
  activeDot: {
    width: 20,
    height: 2,
    backgroundColor: '#fff',
    marginTop: 4
  }
});