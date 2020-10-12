import React, {ReactElement} from 'react';
import {Helmet} from 'react-helmet';
import {graphql, useStaticQuery} from 'gatsby';

type SeoProps = {
  subtitle?: string;
}

type QueryResult = {
  site: {
    siteMetadata: {
      title: string;
      siteUrl: string;
    }
  }
}

export default function Seo({subtitle}: SeoProps): ReactElement {
  const {site: {siteMetadata}}: QueryResult = useStaticQuery(query);
  return (
    <div className="application">
      <Helmet>
        <meta charSet="utf-8"/>
        <title>{siteMetadata.title + (subtitle === undefined ? '' : ' - ' + subtitle)}</title>
        <link rel="canonical" href={siteMetadata.siteUrl}/>
      </Helmet>
    </div>
  );
}

const query = graphql`
  {
    site {
      siteMetadata {
        title
        siteUrl
      }
    }
  }
`;