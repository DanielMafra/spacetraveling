/* eslint-disable prettier/prettier */
import Link from 'next/link';
import Image from 'next/image';
import styles from './header.module.scss';
import common from '../../styles/common.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={styles.header}>
      <div className={common.container}>
        <Link href="/">
          <a>
            <Image src="/assets/logo.svg" alt="logo" width="239" height="27" />
          </a>
        </Link>
      </div>
    </header>
  )
}
