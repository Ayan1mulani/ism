// BillsPage.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { otherServices } from '../../services/otherServices';

export default function BillsPage({ nightMode, id, loading: parentLoading }){
  const [loading,setLoading]=useState(true);
  const [bills,setBills]=useState([]);

  useEffect(()=>{
    if(id) fetchBills();
    else setLoading(false);
  },[id]);

  async function fetchBills(){
    try{
      setLoading(true);
      const resp = await otherServices.getMyaccorunts(id);
      setBills(resp);
    }catch(e){
      console.error(e);
    }finally{
      setLoading(false);
    }
  }

  const styles = getStyles(nightMode);
  if(parentLoading||loading){
    return <ActivityIndicator style={{flex:1,justifyContent:'center'}} size="large" color="#1996D3"/>;
  }
  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={bills||[]}
      keyExtractor={(i,idx)=> (i.id||idx).toString()}
      renderItem={({item})=>(
        <View style={styles.card}>
          <Text style={styles.lbl}>Bill #{item.id}</Text>
          <Text style={styles.val}>Amount: {item.amount}</Text>
          <Text style={styles.val}>Date: {item.bill_date||item.date}</Text>
        </View>
      )}
    />
  );
}

const getStyles=night=>StyleSheet.create({
  list:{padding:16},
  card:{
    backgroundColor: night?'#1e1e1e':'#fff',
    padding:16,
    borderRadius:8,
    marginBottom:12,
    shadowColor:'#000',
    shadowOffset:{width:0,height:2},
    shadowOpacity: night?0.3:0.1,
    shadowRadius:4,
    elevation:3,
  },
  lbl:{color: night?'#fff':'#074B7C', fontSize:16, fontWeight:'600'},
  val:{color:'#1996D3', marginTop:4},
});
