import * as styles from './navigation-footer.module.scss';
import {Link} from 'gatsby';
import React, {ReactElement} from 'react';

type NavigationFooterProps = {
  prev: null | {
    slug: string;
    title: string;
  };
  next: null | {
    slug: string;
    title: string;
  };
}

export default function NavigationFooter({prev, next}: NavigationFooterProps): ReactElement {
  return (
    <div className={styles.container}>
      {prev == null ? <></> : <Link className={styles.prev} to={prev.slug}>← {prev.title}</Link>}
      {next == null ? <></> : <Link className={styles.next} to={next.slug}>{next.title} →</Link>}
    </div>
  );
}