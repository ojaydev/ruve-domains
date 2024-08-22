import express, { Application, Request, Response } from 'express';
import axios, { AxiosResponse } from 'axios';
import * as dotenv from 'dotenv';
import { getDomainInfo } from './namecheap';
import xml2js, { Parser } from 'xml2js';

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, Namecheap API!');
});

app.get('/domain/:name', async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const response = await getDomainInfo(name);

    const parser = new xml2js.Parser({ explicitArray: false });
    
    const result = await parser.parseStringPromise(response.data);

    const apiResponse = result.ApiResponse;
    
    if (apiResponse.Errors) {
      const error = apiResponse.Errors._;
      if (error === `Tld for ${name} is not found`) {
        return res.status(400).send("TLD is not supported.");
      }
      return res.status(400).json({ error });
    }

    const domainCheckResult = apiResponse.CommandResponse.DomainCheckResult;
    
    if (!domainCheckResult || typeof domainCheckResult.$ !== 'object') {
      return res.status(500).json({ error: 'Unexpected API response structure' });
    }

    const isAvailable = domainCheckResult.$.Available === 'true';
    
    res.json({
      domain: name,
      available: isAvailable,
      message: isAvailable ? "Domain is available!" : "Domain is unavailable!"
    });

  } catch (error) {
    console.error('Error checking domain:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
