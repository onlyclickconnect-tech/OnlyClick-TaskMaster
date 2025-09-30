import { StyleSheet, View } from "react-native";
import Text from "../ui/Text";
import TransactionInfoBox from "./TransactionInfoBox";

export default function TransactionCard({ data, onItemPress }) {
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.year}>{data.year}</Text>
          <Text style={styles.month}>{data.month}</Text>
        </View>
        <Text style={styles.total}>{formatAmount(data.total)}</Text>
      </View>
      <View style={styles.transactionsList}>
        {data.entries.map((transaction, index) => (
          <TransactionInfoBox 
            data={transaction} 
            key={index} 
            onPress={onItemPress} 
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffffff",   
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    
  },
  headerLeft: {
    flex: 1,
  },
  year: {
    fontSize: 14,
    color: '#000000ff',
    fontWeight: '500',
  },
  month: {
    fontWeight: "bold", 
    fontSize: 16,
    color: '#00000075',
  },
  total: {
    fontWeight: "bold", 
    fontSize: 18,
    color: '#000000ff',
  },
  transactionsList: {
    padding: 8,
  },
});
