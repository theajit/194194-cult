import type {MetadataRoute} from 'next';
export default function robots():MetadataRoute.Robots{return {rules:{userAgent:'*',allow:'/'},sitemap:'https://cult.pincode.cafe/sitemap.xml',host:'https://cult.pincode.cafe'}}
