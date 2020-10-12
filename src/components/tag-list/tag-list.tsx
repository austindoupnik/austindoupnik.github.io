import {graphql, Link, useStaticQuery} from 'gatsby';
import React, {ReactElement} from 'react';
import {get} from '../../utils/map-util';

type TagListProps = {
  tags: string[];
};

const query = graphql`
{
  allSitePage(filter: {context: {tag: {ne: null}}}) {
    edges {
      node {
        context {
          tag
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
          tag: string;
          slug: string;
        };
      };
    }[];
  };
};

export default function TagList({tags}: TagListProps): ReactElement {
  const {allSitePage: {edges}}: QueryResult = useStaticQuery(query);
  const slugs = new Map<string, string>(edges.map(edge => [edge.node.context.tag, edge.node.context.slug]));

  return (
    <>{sorted(tags).map(name => tag(name, get(slugs, name, k => Error(`Unknown tag name: ${k}`))))}</>
  );
}

function sorted(tags: string[]): string[] {
  return tags.sort((a, b) => a.localeCompare(b));
}

function tag(name: string, slug: string): ReactElement {
  return (
    <React.Fragment key={name}>
      <Link to={slug}>
        #{name}
      </Link>
      {' '}
    </React.Fragment>
  );
}