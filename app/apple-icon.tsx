import {ImageResponse} from 'next/og'

export const size={width:180,height:180}
export const contentType='image/png'

export default function AppleIcon(){
 return new ImageResponse(
  <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#F2B632',color:'#111',borderRadius:'38px',fontFamily:'Arial,Helvetica,sans-serif'}}>
   <div style={{fontSize:39,lineHeight:1,marginBottom:4}}>♨</div>
   <div style={{fontSize:42,fontWeight:900,letterSpacing:-3,lineHeight:0.9}}>TRACE</div>
   <div style={{fontSize:14,letterSpacing:6,fontWeight:600,marginTop:8}}>HACCP</div>
  </div>,
  {...size}
 )
}
