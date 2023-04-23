import https from 'https';
import querystring from 'querystring';
import { CurrentPriceMap } from '../dao/current-price';

export async function getCurrentPrice(from: string, to: string): Promise<number | null> {
    const parameters = {
        fsym: from,
        tsyms: to
    }
    
    // GET parameters as query string : "?id=123&type=post"
    const requestArgs = querystring.stringify(parameters);

    const options: https.RequestOptions = {
        hostname: process.env.CRYPTOCOMPARE_API_URL,
        path: `/data/price?${requestArgs}`,
        method: 'GET',
        headers: {
            'Authorization': `Apikey ${process.env.CRYPTOCOMPARE_API_KEY}`
        }
    };
    
    return new Promise<number>((resolve, reject) => {
        const req = https.request(options, (res) => {
          
            res.on('data', (d) => {
              const data: CurrentPriceMap = JSON.parse(d.toString());
              resolve(data[to]);
            });
        });

        req.on('error', reject);
        req.end();
    });
}