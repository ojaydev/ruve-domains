import axios, { AxiosResponse } from 'axios';
import * as dotenv from 'dotenv';


dotenv.config();

const apiUrl = 'https://api.sandbox.namecheap.com/xml.response';
const apiKey = process.env.USER;
const apiSecret = process.env.API_KEY;

export const getDomainInfo = async (domain: string): Promise<AxiosResponse<any>> => {
    console.log(domain)
  const params = {
    ApiUser: apiKey,
    ApiKey: apiSecret,
    UserName: apiKey,
    Command: 'namecheap.domains.check',
    ClientIp: '102.91.4.85',
    DomainList: domain,
  };

  return axios.get(apiUrl, { params });
};