import { Text as RNText, TextInput as RNTextInput, StyleSheet } from 'react-native';

const Text = (props) => {
  const { style, ...otherProps } = props;
  
  return (
    <RNText 
      {...otherProps}
      style={[
        styles.defaultText, // Apply Poppins globally
        style // Allow component-specific styles to override
      ]}
    />
  );
};



const styles = StyleSheet.create({
  defaultText: {
    fontFamily: 'Poppins-Regular', // Default to Poppins Regular
  }
});

export { Text};
export default Text;