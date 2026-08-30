import { createSessionCookie, hasValidSession, validateBasicHeader } from '../lib/admin-auth.js';

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Robots-Tag','noindex, nofollow');
  if(req.method==='GET'){
    return res.status(200).json({ok:true,authenticated:hasValidSession(req)});
  }
  if(req.method!=='POST') return res.status(405).json({ok:false,error:'Method not allowed'});
  if(!validateBasicHeader(req.headers.authorization)) return res.status(401).json({ok:false,error:'Kullanıcı adı veya şifre hatalı'});
  res.setHeader('Set-Cookie',createSessionCookie());
  return res.status(200).json({ok:true,authenticated:true});
}
