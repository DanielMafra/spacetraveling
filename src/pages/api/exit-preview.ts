/* eslint-disable prettier/prettier */
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse
) {
  res.clearPreviewData();
  res.writeHead(307, { location: '/' });
  res.end();
}