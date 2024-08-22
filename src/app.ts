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

    // Create a new parser instance
    const parser: Parser = new xml2js.Parser({ explicitArray: false });

    // Parse the XML string into JSON
    parser.parseString(response.data, (err: Error | null, result: any) => {
      if (err) {
        res.status(500).json({ error: 'Error parsing XML response' });
        return;
      }
      // Send formatted JSON response
      let real_result = result.ApiResponse.CommandResponse.DomainCheckResult.$.Available;

      if (real_result === "true") {
          res.send("Domain is available");
      } else {
          res.send("Domain is unavailable");
      }

    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
