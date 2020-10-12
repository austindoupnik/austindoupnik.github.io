import React, {ReactElement} from 'react';
import BlogPostHeader from '../blog-post-header/blog-post-header';
import * as styles from '../blog-post-list/blog-post-list.module.scss';

type BlogPostListProps = {
  posts: {
    node: BlogPostProps;
  }[];
};

type BlogPostProps = {
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
};

export default function BlogPostList({posts}: BlogPostListProps): ReactElement {
  return (
    <div className={styles.container}>
      {posts.map(({node}, i) => BlogPost(i, node))}
    </div>
  );
}

function BlogPost(i: number, {fields: {slug}, frontmatter: {title, series, date, tags}}: BlogPostProps): ReactElement {
  return (
    <article key={i}>
      <BlogPostHeader slug={slug} title={title} series={series} tags={tags} date={date}/>
    </article>
  );
}