import slugify from 'slugify';
import path from 'path';
import {createFilePath} from 'gatsby-source-filesystem';
import {Node} from 'gatsby';

type BlogPostQueryResult = {
  data: {
    allMarkdownRemark: {
      edges: {
        node: {
          fields: {
            slug: string;
          };
        };
        previous: unknown;
        next: unknown;
      }[];
    };
  };
  errors: string[];
};

type GraphQL = (query: string) => unknown;

type TagQueryResult = {
  data: {
    allMarkdownRemark: {
      edges: {
        node: {
          frontmatter: {
            tags: string[];
          }
        };
      }[];
    };
  };
  errors: string[];
};

type Series = {
  title: string;
  part: number;
};

type SeriesQueryResult = {
  data: {
    allMarkdownRemark: {
      edges: {
        node: {
          frontmatter: {
            series: Series;
          }
        };
      }[];
    };
  };
  errors: string[];
};

type PageInput = {
  path: string;
  component: string;
  layout?: string;
  context?: unknown;
};

type BoundActionCreators = {
  createPage: (page: PageInput) => void;
  deletePage: (page: PageInput) => void;
  createRedirect: (
    opts: {
      fromPath: string
      isPermanent?: boolean
      redirectInBrowser?: boolean
      toPath: string
    }
  ) => void;
  createNodeField: (page: { node: unknown, name: string, value: string }) => void;
};

type CreatePages = {
  graphql: GraphQL;
  actions: BoundActionCreators;
}

type CreateNode = {
  node: Node;
  getNode: () => unknown;
  actions: BoundActionCreators;
}

async function createBlogPostPages(graphql: GraphQL, createPage: (page: PageInput) => void) {
  const query = `
      {
        allMarkdownRemark(sort: {fields: frontmatter___date, order: ASC}) {
          edges {
            previous {
              fields {
                slug
              }
              frontmatter {
                title
              }
            }

            node {
              fields {
                slug
              }
              frontmatter {
                title
              }
            }

            next {
              fields {
                slug
              }
              frontmatter {
                title
              }
            }
          }
        }
      }
    `;
  const result: BlogPostQueryResult = await graphql(query) as BlogPostQueryResult;

  if (result.errors) {
    throw result.errors;
  }

  const posts = result.data.allMarkdownRemark.edges;

  posts.forEach(post => {
    createPage({
      path: post.node.fields.slug,
      component: path.resolve('./src/templates/blog-post/blog-post.tsx'),
      context: {
        slug: post.node.fields.slug,
        previous: post.previous,
        next: post.next,
      },
    });
  });
}

async function createTagPages(graphql: GraphQL, createPage: (page: PageInput) => void) {
  const query = `
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
  const result: TagQueryResult = await graphql(query) as TagQueryResult;

  if (result.errors) {
    throw result.errors;
  }

  const tags = new Set<string>();
  result.data.allMarkdownRemark.edges.forEach(edge => edge.node.frontmatter.tags.forEach(tag => tags.add(tag)));

  tags.forEach(tag => {
    const slug = `/tag/${slugify(tag, {lower: true})}`;
    createPage({
      path: slug,
      component: path.resolve('./src/templates/tag/tag.tsx'),
      context: {
        tag,
        slug,
      },
    });
  });
}

async function createSeriesPages(graphql: GraphQL, createPage: (page: PageInput) => void) {
  const query = `
      {
        allMarkdownRemark {
          edges {
            node {
              frontmatter {
                series {
                  title
                  part
                }
              }
            }
          }
        }
      }
    `;
  const result: SeriesQueryResult = await graphql(query) as SeriesQueryResult;

  if (result.errors) {
    throw result.errors;
  }

  const allSeries = new Set<Series>();
  result.data.allMarkdownRemark.edges.forEach(edge => {
    if (edge.node.frontmatter.series) {
      allSeries.add(edge.node.frontmatter.series);
    }
  });

  allSeries.forEach(series => {
    const slug = `/series/${slugify(series.title, {lower: true})}`;
    createPage({
      path: slug,
      component: path.resolve('./src/templates/series/series.tsx'),
      context: {
        series___title: series.title,
        series___part: series.part,
        slug,
      },
    });
  });
}

exports.createPages = async ({graphql, actions}: CreatePages) => {
  const {createPage} = actions;
  await createBlogPostPages(graphql, createPage);
  await createTagPages(graphql, createPage);
  await createSeriesPages(graphql, createPage);
};

exports.onCreateNode = ({node, getNode, actions}: CreateNode) => {
  const {createNodeField} = actions;
  if (node.internal.type === 'MarkdownRemark') {
    const slug = createFilePath({node, getNode, basePath: 'src/posts'});
    createNodeField({
      node,
      name: 'slug',
      value: `/post${slug}`,
    });
  }
};