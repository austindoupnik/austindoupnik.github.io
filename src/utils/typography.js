import Typography from 'typography';
import githubTheme from 'typography-theme-github';

githubTheme.overrideThemeStyles = () => ({
  'h1,h2,h3,h4,h5,h6': {
    borderBottom: 'initial',
    color: 'initial',
  }
});

const typography = new Typography(githubTheme);

export const {scale, rhythm, options} = typography;
export default typography;