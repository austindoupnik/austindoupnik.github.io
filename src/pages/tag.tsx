import React, {ReactElement} from 'react';
import {graphql, Link} from 'gatsby';
import Layout from '../components/layout/layout';

type QueryResult = {
  data: {
    allMarkdownRemark: {
      edges: {
        node: {
          frontmatter: {
            tags: string[];
          };
        };
      }[];
    };
  };
}

function countTaggedPosts(tags: Map<string, number>): (tag: string) => void {
  return tag => {
    const count = tags.get(tag);
    if (count == undefined) {
      tags.set(tag, 1);
    } else {
      tags.set(tag, count + 1);
    }
  };
}

function sortedTags(tags: Map<string, number>): [string, number][] {
  return Array.from(tags.entries()).sort(([a,], [b,]) => a.localeCompare(b));
}

export default function Tag({data: {allMarkdownRemark: {edges}}}: QueryResult): ReactElement {
  const tags = new Map<string, number>();
  edges.forEach(edge => edge.node.frontmatter.tags.forEach(countTaggedPosts(tags)));

  return (
    <Layout>
      {sortedTags(tags).map(([tag, count]) => <p key={tag}><Link to={`/tag/${tag}`}>{tag}</Link> ({count})</p>)}
    </Layout>
  );
}

export const query = graphql`
  {
    allMarkdownRemark {
      edges {
        node {
          frontmatter {
            tags
          }
        }
      }
    }
  }
`;