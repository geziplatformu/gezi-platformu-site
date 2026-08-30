import { clearSessionCookie } from '../lib/admin-auth.js';

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Robots-Tag','noindex, nofollow');
  if(req.method!=='POST') return res.status(405).json({ok:false,error:'Method not allowed'});
  res.setHeader('Set-Cookie',clearSessionCookie());
  return res.status(200).json({ok:true});
}
