/* eslint-disable prettier/prettier */
import { useState } from 'react';
import Link from 'next/link';
import { GetStaticProps } from 'next';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import Head from 'next/head';
import { parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getPrismicClient } from '../services/prismic';
import common from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}

export default function Home({ postsPagination, preview }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  function handleLoadPosts(): void {
    fetch(nextPage)
      .then(response => response.json())
      .then(data => {
        const updatedPosts = data.results.map(post => {
          return {
            uid: post.uid,
            first_publication_date: post.first_publication_date,
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            }
          }
        });

        setPosts([...posts, ...updatedPosts]);
        setNextPage(data.next_page);
      });
  }

  return (
    <>
      <Head>
        <title>Spacetraveling</title>
      </Head>
      <main className={common.container}>
        <div className={styles.posts}>
          {posts.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div>
                  <span><FiCalendar />{format(parseISO(post.first_publication_date), 'dd MMM yyyy', {
                    locale: ptBR,
                  })}</span>
                  <span><FiUser />{post.data.author}</span>
                </div>
              </a>
            </Link>
          ))}
        </div>

        {nextPage && (
          <button onClick={handleLoadPosts} type="button" className={styles.loadMore}>
            Carregar mais posts
          </button>
        )}

        {preview && (
          <Link href="/api/exit-preview">
            <a>Sair do modo preview</a>
          </Link>
        )}
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({ preview = false, dataPrev }) => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'post')
  ], {
    fetch: ['post.title', 'post.subtitle', 'post.author'],
    pageSize: 1,
    ref: dataPrev?.ref ?? null,
  });

  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    }
  });

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results,
      },
      preview
    }
  }
};
