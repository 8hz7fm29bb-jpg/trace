import type {NextConfig} from 'next'

const noCache=[{key:'Cache-Control',value:'no-store, no-cache, must-revalidate, max-age=0'}]

const nextConfig:NextConfig={
  async headers(){
    return [
      {source:'/',headers:noCache},
      {source:'/manifest.webmanifest',headers:noCache},
      {source:'/api/version',headers:noCache},
    ]
  },
}

export default nextConfig
