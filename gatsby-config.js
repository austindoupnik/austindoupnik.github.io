// eslint-disable-next-line @typescript-eslint/no-var-requires,no-undef
const {generateConfig} = require('gatsby-plugin-ts-config');

// eslint-disable-next-line no-undef
module.exports = generateConfig(
  {
    // eslint-disable-next-line no-undef
    projectRoot: __dirname,
    configDir: '.gatsby',
  },
  {
  }
);