import React, {ReactElement, ReactNode} from 'react';
import * as styles from './layout.module.scss';
import Seo from '../seo/seo';
import {graphql, Link, useStaticQuery} from 'gatsby';
import './layout.scss';
import SocialMedia from '../social-media/social-media';

type LayoutProps = {
  children: ReactNode;
  subtitle?: string;
  footer?: ReactNode;
}

type QueryResult = {
  site: {
    siteMetadata: {
      title: string;
      author: string;
    };
  };
};

const query = graphql`
{
  site {
    siteMetadata {
      title
      author
    }
  }
}
`;

export default function Layout({children, subtitle, footer}: LayoutProps): ReactElement {
  const {site: {siteMetadata}}: QueryResult = useStaticQuery(query);
  return (
    <>
      <Seo subtitle={subtitle}/>

      <div className={styles.layout}>
        <Header title={siteMetadata.title}/>

        {children}

        {footer}
      </div>
    </>
  );
}

function Header({title}: { title: string }) {
  return (
    <div className={styles.header}>

      <Link to="/">
        <h1>
          {title}
        </h1>
      </Link>

      <SocialMedia/>
    </div>
  );
}