import seed from '../data/pincodes.json';

export type PostOffice={officeName:string;officeType?:string;deliveryStatus?:string};
export type PinRecord={pincode:string;district:string;state:string;postOffices:PostOffice[]};
const records=seed as PinRecord[];
const slug=(v:string)=>v.toLowerCase().trim().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export const allPins=()=>records;
export const getPin=(pin:string)=>records.find(r=>r.pincode===pin);
export const states=()=>[...new Set(records.map(r=>r.state))].sort();
export const districtsForState=(stateSlug:string)=>[...new Set(records.filter(r=>slug(r.state)===stateSlug).map(r=>r.district))].sort();
export const pinsForDistrict=(stateSlug:string,districtSlug:string)=>records.filter(r=>slug(r.state)===stateSlug&&slug(r.district)===districtSlug);
export const stateBySlug=(s:string)=>states().find(x=>slug(x)===s);
export const districtBySlug=(s:string,d:string)=>districtsForState(s).find(x=>slug(x)===d);
export {slug};
