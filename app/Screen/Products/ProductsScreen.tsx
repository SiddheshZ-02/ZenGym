import { Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { TouchableOpacity } from 'react-native'

const ProductsScreen = () => {

  const  source= require("@assets/images/slide5.jpg")
  return (
    <View>
         <View style={styles.slideWrap}>
                 <TouchableOpacity
                  //  onPress={() => handleSlidePress(item.linkUrl)}
                   style={styles.slideImage}
                 >
                   <Image source={source} style={styles.slideImage} />
                 </TouchableOpacity>
               </View>
    </View>
  )
}

export default ProductsScreen



const styles = StyleSheet.create({
     slideWrap: {
      alignItems: "center",
      paddingVertical: 20,
    },
    slideImage: {
      height: 200,
      width: 300,
      resizeMode: "cover",
      borderRadius: 20,
      backgroundColor: "black",
    },
})