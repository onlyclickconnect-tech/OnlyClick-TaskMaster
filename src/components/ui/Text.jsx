import { Text as RNText, StyleSheet } from 'react-native';

const Text = (props) => {
  const { style, ...otherProps } = props;
  
  // Flatten the style to extract fontWeight
  const flattenedStyle = StyleSheet.flatten(style);
  const fontWeight = flattenedStyle?.fontWeight;
  
  let fontFamily = 'Poppins_400Regular'; // Default
  
  // Map fontWeight to appropriate Poppins font
  if (fontWeight === 'bold' || fontWeight === '700') {
    fontFamily = 'Poppins_700Bold';
  } else if (fontWeight === '600' || fontWeight === 'semibold') {
    fontFamily = 'Poppins_600SemiBold';
  } else if (fontWeight === '500') {
    fontFamily = 'Poppins_500Medium';
  }
  
  // Create new style object without fontFamily to avoid conflicts
  const { fontFamily: _, ...styleWithoutFontFamily } = flattenedStyle || {};
  
  return (
    <RNText 
      {...otherProps}
      style={[
        styles.defaultText,
        styleWithoutFontFamily, // Apply original styles without fontFamily
        { fontFamily }, // Apply the correct Poppins font last
      ]}
    />
  );
};



const styles = StyleSheet.create({
  defaultText: {
    fontFamily: 'Poppins_400Regular', // Default to Poppins Regular
  }
});

export { Text };
export default Text;