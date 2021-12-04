/* eslint-disable prettier/prettier */
import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import Image from 'next/image';
import Head from 'next/head';
import { parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { getPrismicClient } from '../../services/prismic';
import Comments from '../../components/Comments';
import common from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  previousPost: {
    slug: string;
    title: string;
  }
  nextPost: {
    slug: string;
    title: string;
  };
  preview: boolean
}

export default function Post({ post, preview, previousPost, nextPost }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <strong>Carregando...</strong>
  }

  const wordsCounter = post.data.content.reduce((total, content) => {
    total += content.heading.split(' ').length;

    const words = content.body.map(item => item.text.split(' ').length);
    words.map(word => (total += word));

    return total;
  }, 0);

  const readIn = `${Math.ceil(wordsCounter / 200).toString()} min`;

  return (
    <>
      <Head>
        <title>{post.data.title} | Spacetraveling</title>
      </Head>
      <div className={styles.banner}>
        {post.data.banner.url && (
          <Image src={post.data.banner.url} alt={post.data.title} width="auto" height="auto" />
        )}
      </div>
      <article className={`${common.container} ${styles.content}`}>
        <h1>{post.data.title}</h1>
        <div>
          <span><FiCalendar />{format(parseISO(post.first_publication_date), 'dd MMM yyyy', {
            locale: ptBR,
          })}</span>
          <span><FiUser />{post.data.author}</span>
          <span><FiClock />{readIn}</span>
        </div>

        {post.data.content.map(({ heading, body }) => (
          <div key={heading}>
            <h2>{heading}</h2>
            <div dangerouslySetInnerHTML={{ __html: RichText.asHtml(body) }} />
          </div>
        ))}
      </article>
      {previousPost && (
        <Link href={`/post/${previousPost.slug}`}>
          <a>{previousPost.title}<span>Post anterior</span></a>
        </Link>
      )}
      {nextPost && (
        <Link href={`/post/${nextPost.slug}`}>
          <a>{nextPost.title}<span>Post seguinte</span></a>
        </Link>
      )}
      <Comments />
      {preview && (
        <Link href="/api/exit-preview">
          <a>Sair do modo preview</a>
        </Link>
      )}
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'post')
  ], {
    pageSize: 1,
  });

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid
      }
    }
  });

  return {
    paths,
    fallback: true,
  }
};

export const getStaticProps: GetStaticProps<PostProps> = async ({ params, preview = false, dataPrev }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {
    ref: dataPrev?.ref ?? null,
  });

  const prevResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title'],
      pageSize: 1,
      after: response.id,
      orderings: '[document.first_publication_date desc]',
      ref: dataPrev?.ref ?? null
    }
  )

  const nextResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title'],
      pageSize: 1,
      after: response.id,
      orderings: '[document.first_publication_date]',
      ref: dataPrev?.ref ?? null
    }
  )

  const post = {
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    uid: response.uid,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url //.banner or .image
      },
      author: response.data.author,
      content: response.data.content
    }
  }

  const previousPost = prevResponse.results.length > 0 ? {
    slug: prevResponse.results[0].uid,
    title: prevResponse.results[0].data.title,
  } : null;

  const nextPost = nextResponse.results.length > 0 ? {
    slug: nextResponse.results[0].uid,
    title: nextResponse.results[0].data.title,
  } : null;

  return {
    props: {
      post,
      preview,
      previousPost,
      nextPost
    }
  }
};
