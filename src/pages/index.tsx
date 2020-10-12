import React, {ReactElement} from 'react';
import {graphql} from 'gatsby';
import Layout from '../components/layout/layout';
import BlogPostList from '../components/blog-post-list/blog-post-list';

type QueryResult = {
  data: {
    allMarkdownRemark: {
      edges: {
        node: {
          frontmatter: {
            title: string;
            series: null | {
              title: string;
              part: number;
            };
            date: string;
            tags: string[];
          };
          fields: {
            slug: string;
          };
        };
      }[];
    };
  };
};

export default function Index({data: {allMarkdownRemark: {edges}}}: QueryResult): ReactElement {
  return (
    <Layout>
      <BlogPostList posts={edges}/>
    </Layout>
  );
}

export const query = graphql`
  {
    allMarkdownRemark(sort: {fields: frontmatter___date, order: DESC}) {
      edges {
        node {
          frontmatter {
            title
            series {
              title
              part
            }
            date(formatString: "MMMM DD, YYYY")
            tags
          }
          fields {
            slug
          }
        }
      }
    }
  }
`;