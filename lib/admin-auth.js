import crypto from 'node:crypto';

const ADMIN_HASH='7c0bc256e953baff98d0ee7f1b29c753861b67d50f7d8ebc99ac9d8ac14e2a1a';
const COOKIE='gp_admin_session';
const MAX_AGE=60*60*24*30;

function safeEqual(a,b){
  const aa=Buffer.from(String(a));
  const bb=Buffer.from(String(b));
  return aa.length===bb.length && crypto.timingSafeEqual(aa,bb);
}

function signingKey(){
  const secret=process.env.GOOGLE_CLIENT_SECRET;
  if(!secret) throw new Error('GOOGLE_CLIENT_SECRET is not configured');
  return crypto.createHash('sha256').update('gp-admin-session-v1:'+secret).digest();
}

function sign(payload){
  return crypto.createHmac('sha256',signingKey()).update(payload).digest('base64url');
}

export function validateBasicHeader(header){
  try{
    const value=String(header||'');
    if(!value.startsWith('Basic ')) return false;
    const decoded=Buffer.from(value.slice(6),'base64').toString('utf8');
    const digest=crypto.createHash('sha256').update(decoded).digest('hex');
    return safeEqual(digest,ADMIN_HASH);
  }catch{return false;}
}

export function createSessionCookie(){
  const exp=Math.floor(Date.now()/1000)+MAX_AGE;
  const payload=Buffer.from(JSON.stringify({v:1,exp})).toString('base64url');
  const token=payload+'.'+sign(payload);
  return `${COOKIE}=${token}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Strict`;
}

export function clearSessionCookie(){
  return `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;
}

export function hasValidSession(req){
  try{
    const raw=String(req.headers.cookie||'');
    const pair=raw.split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='));
    if(!pair) return false;
    const token=pair.slice(COOKIE.length+1);
    const [payload,sig]=token.split('.');
    if(!payload||!sig||!safeEqual(sig,sign(payload))) return false;
    const data=JSON.parse(Buffer.from(payload,'base64url').toString('utf8'));
    return data?.v===1 && Number(data.exp)>Math.floor(Date.now()/1000);
  }catch{return false;}
}
