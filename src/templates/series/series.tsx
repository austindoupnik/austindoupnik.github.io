import React, {ReactElement} from 'react';
import Layout from '../../components/layout/layout';
import BlogPostList from '../../components/blog-post-list/blog-post-list';
import {graphql} from 'gatsby';

type QueryResult = {
  data: {
    allMarkdownRemark: {
      edges: {
        node: {
          fields: {
            slug: string;
          };
          frontmatter: {
            title: string;
            series: null | {
              title: string;
              part: number;
            };
            date: string;
            tags: string[];
          };
          excerpt: string;
        };
      }[];
    };
  };
}

export default function Series({data: {allMarkdownRemark: {edges}}}: QueryResult): ReactElement {
  return (
    <Layout>
      <BlogPostList posts={edges}/>
    </Layout>
  );
}

export const query = graphql`
  query BlogPostBySeries($series___title: String!) {
    allMarkdownRemark(filter: {frontmatter: {series: {title: {eq: $series___title}}}}, sort: {fields: frontmatter___date, order: DESC}) {
      edges {
        node {
          fields {
            slug
          }
          frontmatter {
            title
            date(formatString: "MMMM DD, YYYY")
            series {
              title
              part
            }
            tags
          }
          excerpt
        }
      }
    }
  }
`;