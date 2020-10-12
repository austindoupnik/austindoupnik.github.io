import React, {ReactElement} from 'react';
import {graphql} from 'gatsby';
import Layout from '../../components/layout/layout';
import BlogPostList from '../../components/blog-post-list/blog-post-list';

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

export default function Tag({data: {allMarkdownRemark: {edges}}}: QueryResult): ReactElement {
  return (
    <Layout>
      <BlogPostList posts={edges}/>
    </Layout>
  );
}

export const query = graphql`
  query BlogPostByTag($tag: String!) {
    allMarkdownRemark(filter: {frontmatter: {tags: {in: [$tag]}}}, sort: {fields: frontmatter___date, order: DESC}) {
      edges {
        node {
          fields {
            slug
          }
          frontmatter {
            title
            date(formatString: "MMMM DD, YYYY")
            tags
            series {
              title
              part
            }
          }
          excerpt
        }
      }
    }
  }
`;