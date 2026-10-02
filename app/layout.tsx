import './globals.css'
import type { Metadata, Viewport } from 'next'
export const metadata:Metadata={title:'TRACE',description:'Tracciabilità e lotti Officina22',manifest:'/manifest.webmanifest',icons:{icon:[{url:'/icons/trace-master-20261001-32.png',sizes:'32x32',type:'image/png'},{url:'/icons/trace-master-20261001-192.png',sizes:'192x192',type:'image/png'}],apple:[{url:'/icons/trace-master-20261001-180.png',sizes:'180x180',type:'image/png'}]},appleWebApp:{capable:true,title:'TRACE',statusBarStyle:'default'}}
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#171717'}
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="it"><body>{children}</body></html>}