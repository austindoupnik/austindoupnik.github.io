type FeedQueryResult = {
  query: {
    site: {
      siteMetadata: {
        siteUrl: string;
      };
    };
    allMarkdownRemark: {
      edges: {
        node: {
          frontmatter: {
            title: string;
            date: string;
            series: {
              title: string;
              part: number;
            };
          };
          excerpt: string;
          fields: {
            slug: string;
          };
          html: string;
        };
      }[];
    };
  };
};

type FeedResult = {
  title: string;
  description: string;
  date: string;
  url: string;
  guid: string;
  custom_elements: { 'content:encoded': string }[];
}[];

export default {
  siteMetadata: {
    title: 'Austin Doupnik',
    siteUrl: 'https://austindoupnik.github.io',
    description: 'Austin Doupnik\'s Web Log',
    author: 'Austin Doupnik'
  },
  plugins: [
    {
      resolve: 'gatsby-plugin-google-analytics',
      options: {
        trackingId: 'UA-181001740-1',
        head: true,
        anonymize: true,
        respectDNT: true,
        cookieFlags: 'SameSite=None; Secure',
        cookieDomain: 'austindoupnik.github.io',
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: `${__dirname}/../src/posts`,
        name: 'posts',
      },
    },
    {
      resolve: 'gatsby-transformer-remark',
      options: {
        plugins: [
          'gatsby-remark-katex',
          'gatsby-remark-autolink-headers',
          {
            resolve: 'gatsby-remark-prismjs',
            options: {
              noInlineHighlight: true,
              prompt: {
                user: 'austind',
                global: false,
              },
            },
          },
          {
            resolve: 'gatsby-remark-images',
            options: {
              maxWidth: 900,
              showCaptions: [
                'title',
              ],
            },
          },
        ],
      },
    },
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: 'Austin Doupnik',
        short_name: 'Austin Doupnik',
        start_url: '/',
        background_color: '#f7f0eb',
        theme_color: '#a2466c',
        display: 'standalone',
        icon: 'favicon.png',
      },
    },
    {
      resolve: 'gatsby-plugin-typography',
      options: {
        pathToConfigModule: 'src/utils/typography',
      },
    },
    'gatsby-plugin-sass',
    {
      resolve: 'gatsby-plugin-feed',
      options: {
        query: `
          {
            site {
              siteMetadata {
                title
                description
                siteUrl
                site_url: siteUrl
              }
            }
          }
        `,
        feeds: [
          {
            serialize: ({query: {site, allMarkdownRemark}}: FeedQueryResult): FeedResult => {
              return allMarkdownRemark.edges.map((edge) => {
                return {
                  title: (edge.node.frontmatter.series == null ? '' : edge.node.frontmatter.series.title + ': ') + edge.node.frontmatter.title,
                  description: edge.node.excerpt,
                  date: edge.node.frontmatter.date,
                  url: site.siteMetadata.siteUrl + edge.node.fields.slug,
                  guid: site.siteMetadata.siteUrl + edge.node.fields.slug,
                  custom_elements: [
                    {
                      'content:encoded': edge.node.html
                    },
                  ],
                };
              });
            },
            query: `
              {
                allMarkdownRemark(sort: {order: DESC, fields: [frontmatter___date]}) {
                  edges {
                    node {
                      excerpt
                      html
                      fields {
                        slug
                      }
                      frontmatter {
                        title
                        series {
                          title
                        }
                        date
                      }
                    }
                  }
                }
              }
            `,
            output: '/rss.xml',
            title: 'Austin Doupnik\'s Web Log',
          },
        ],
      },
    },
    'gatsby-plugin-sharp',
    'gatsby-plugin-sitemap',
    'gatsby-plugin-robots-txt',
  ],
};