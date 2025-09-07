import { View, Text,  } from 'react-native'
import React from 'react'

const Slogan = () => {
  return (
   
       <View
              style={{
                // backgroundColor: "gray",
                height: 180,
                justifyContent: "space-between",
                flexDirection: "row",
                alignItems: "center",
                padding: 20,
              }}
            >
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 40, fontWeight: 600,  color:"white"}}>READY TO </Text>
                <Text style={{ fontSize: 40, fontWeight: 900,  color:"#32CD32"}}>WORKOUT </Text>
              </View>
              
            </View>
    
  )
}

export default Slogan