import React, {ReactElement} from 'react';
import Layout from '../components/layout/layout';

export default function PageNotFound(): ReactElement {
  return (
    <Layout>
      <h2>Page not found</h2>
      <p><b>Oops!</b> The page you are looking for has been removed, relocated, or never existed.</p>
    </Layout>
  );
}