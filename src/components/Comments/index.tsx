/* eslint-disable prettier/prettier */
import { useEffect, useRef } from 'react';

export default function Comments() {
  const commentsSection = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.setAttribute('src', 'https://utteranc.es/client.js');
    script.setAttribute('repo', 'danielmafra/desafio05-trilha-reactjs');
    script.setAttribute('issue-term', 'pathname');
    script.setAttribute('theme', 'github-dark');
    script.setAttribute('crossorigin', 'anonymous');
    script.setAttribute('async', 'true');

    commentsSection.current.appendChild(script);
  }, []);

  return <div ref={commentsSection}></div>;
}