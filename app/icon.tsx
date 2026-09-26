import {ImageResponse} from 'next/og'

export const size={width:512,height:512}
export const contentType='image/png'

export default function Icon(){
 return new ImageResponse(
  <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#F2B632',color:'#111',borderRadius:'112px',fontFamily:'Arial,Helvetica,sans-serif'}}>
   <div style={{fontSize:112,lineHeight:1,marginBottom:16}}>♨</div>
   <div style={{fontSize:118,fontWeight:900,letterSpacing:-8,lineHeight:0.9}}>TRACE</div>
   <div style={{display:'flex',alignItems:'center',gap:20,marginTop:24}}>
    <div style={{width:86,height:4,background:'#111'}}/>
    <div style={{fontSize:44,letterSpacing:18,fontWeight:500}}>HACCP</div>
    <div style={{width:86,height:4,background:'#111'}}/>
   </div>
  </div>,
  {...size}
 )
}
