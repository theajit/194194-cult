export type CultStatus='ACTIVE'|'FORMING'|'NOT_HERE_YET';
export type Pincode={pincode:string;office:string;district:string;state:string;status:CultStatus;chapter?:string;host?:string;since?:number;members?:number};

// MVP seed. Production import is designed to replace/extend this from the official India Post/OGD directory.
export const pincodes:Pincode[]=[
 {pincode:'759001',office:'Dhenkanal H.O',district:'Dhenkanal',state:'Odisha',status:'ACTIVE',chapter:'Founding Chapter',host:'Pin Code Café',since:2026,members:1},
 {pincode:'751001',office:'Bhubaneswar G.P.O.',district:'Khordha',state:'Odisha',status:'NOT_HERE_YET'},
 {pincode:'110001',office:'New Delhi G.P.O.',district:'New Delhi',state:'Delhi',status:'NOT_HERE_YET'},
 {pincode:'560001',office:'Bengaluru G.P.O.',district:'Bengaluru',state:'Karnataka',status:'NOT_HERE_YET'}
];
export const findPincode=(pin:string)=>pincodes.find(x=>x.pincode===pin);
