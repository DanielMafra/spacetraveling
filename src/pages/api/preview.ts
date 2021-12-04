/* eslint-disable prettier/prettier */
import { NextApiRequest, NextApiResponse } from "next";
import { Document } from "@prismicio/client/types/documents";
import { getPrismicClient } from "../../services/prismic";

function linkResolver(doc: Document) {
  if (doc.type === 'posts') {
    return `/post/${doc.uid}`;
  }
  return '/';
}

export default async function createPreview(req: NextApiRequest, res: NextApiResponse) {
  const prismic = getPrismicClient(req);
  const { token: ref, documentId } = req.query;

  const preview = await prismic.getPreviewResolver(String(ref), String(documentId)).resolve(linkResolver, '/');

  if (!preview) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  res.setPreviewData({ ref });
  res.writeHead(302, { location: `${preview}` });
  res.end();
}