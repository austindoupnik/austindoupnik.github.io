import React, {ReactElement} from 'react';
import {graphql} from 'gatsby';
import Layout from '../../components/layout/layout';
import NavigationFooter from '../../components/navigation-footer/navigation-footer';
import * as styles from './blog-post.module.scss';
import BlogPostHeader from '../../components/blog-post-header/blog-post-header';

type QueryResult = {
  data: {
    markdownRemark: {
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
      html: string;
    };
  };

  pageContext: {
    previous: {
      fields: {
        slug: string;
      };
      frontmatter: {
        title: string;
      };
    };
    next: {
      fields: {
        slug: string;
      };
      frontmatter: {
        title: string;
      };
    };
  }
}

export default function BlogPost({data: {markdownRemark: {frontmatter, fields, html}}, pageContext}: QueryResult): ReactElement {
  const prev = pageContext.previous == null ? null : {
    slug: pageContext.previous.fields.slug,
    title: pageContext.previous.frontmatter.title,
  };
  const next = pageContext.next == null ? null : {
    slug: pageContext.next.fields.slug,
    title: pageContext.next.frontmatter.title,
  };

  return (
    <Layout subtitle={frontmatter.title} footer={<NavigationFooter prev={prev} next={next}/>}>
      <div className={styles.container}>
        <article>
          <BlogPostHeader
            slug={fields.slug}
            title={frontmatter.title}
            series={frontmatter.series}
            tags={frontmatter.tags}
            date={frontmatter.date}
          />
          <div className={styles.article} dangerouslySetInnerHTML={{__html: html}}/>
        </article>
      </div>
    </Layout>
  );
}

export const query = graphql`
  query BlogPostBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
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
`;