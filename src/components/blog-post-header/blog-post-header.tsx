import React, {ReactElement} from 'react';
import {graphql, Link, useStaticQuery} from 'gatsby';
import * as styles from '../blog-post-header/blog-post-header.module.scss';
import TagList from '../tag-list/tag-list';
import {get} from '../../utils/map-util';

export type BlogPostHeaderProps = {
  slug: string;
  title: string;
  series: null | {
    title: string;
    part: number;
  };
  tags: string[];
  date: string;
};

const query = graphql`
{
  allSitePage(filter: {context: {series___title: {ne: null}}}) {
    edges {
      node {
        context {
          series___title
          slug
        }
      }
    }
  }
}
`;

type QueryResult = {
  allSitePage: {
    edges: {
      node: {
        context: {
          series___title: string;
          slug: string;
        };
      };
    }[];
  };
};

export default function BlogPostHeader(props: BlogPostHeaderProps): ReactElement {
  const {allSitePage: {edges}}: QueryResult = useStaticQuery(query);
  const slugs = new Map<string, string>(edges.map(edge => [edge.node.context.series___title, edge.node.context.slug]));

  return (
    <header className={styles.header}>
      <Link to={props.slug} className={styles.title}>
        <h2>{props.title}</h2>
      </Link>
      <div className={styles.subtitle}>
        <span className={styles.date}>{props.date}</span>
        {props.series === null ? <></> : Series(props.series.title, props.series.part, get(slugs, props.series.title, k => Error(`Unknown series title: ${k}`)))}
        <span>
          <TagList tags={props.tags}/>
        </span>
      </div>
    </header>
  );
}

function Series(title: string, part: number, slug: string): ReactElement {
  return (
    <span className={styles.series}>
      Part {part} of&nbsp;
      <Link to={slug}>
        {title}
      </Link>
    </span>
  );
}