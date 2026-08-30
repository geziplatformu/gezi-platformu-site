import { getVercelOidcToken } from '@vercel/oidc';

const PROJECT_NUMBER='332223419700';
const POOL_ID='vercel-gezi-platformu';
const PROVIDER_ID='vercel-gezi-platformu';
const SERVICE_ACCOUNT='gezi-platformu-analytics@project-5028ec93-ee7e-422b-92f.iam.gserviceaccount.com';
const AUDIENCE=`https://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/providers/${PROVIDER_ID}`;

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  try{
    const subjectToken=await getVercelOidcToken({audience:AUDIENCE});
    if(!subjectToken)return res.status(500).json({ok:false,stage:'vercel_oidc',error:'missing token'});
    const sts=await fetch('https://sts.googleapis.com/v1/token',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({audience:AUDIENCE,grantType:'urn:ietf:params:oauth:grant-type:token-exchange',requestedTokenType:'urn:ietf:params:oauth:token-type:access_token',scope:'https://www.googleapis.com/auth/cloud-platform',subjectTokenType:'urn:ietf:params:oauth:token-type:jwt',subjectToken})});
    const sd=await sts.json();
    if(!sts.ok||!sd.access_token)return res.status(500).json({ok:false,stage:'google_sts',status:sts.status,error:sd.error_description||sd.error||'STS failed'});
    const imp=await fetch(`https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${encodeURIComponent(SERVICE_ACCOUNT)}:generateAccessToken`,{method:'POST',headers:{Authorization:`Bearer ${sd.access_token}`,'Content-Type':'application/json'},body:JSON.stringify({scope:['https://www.googleapis.com/auth/analytics.readonly'],lifetime:'3600s'})});
    const id=await imp.json();
    if(!imp.ok||!id.accessToken)return res.status(500).json({ok:false,stage:'service_account',status:imp.status,error:id?.error?.message||id.error||'impersonation failed'});
    return res.status(200).json({ok:true,stage:'complete'});
  }catch(e){return res.status(500).json({ok:false,stage:'exception',error:e?.message||String(e)})}
}
