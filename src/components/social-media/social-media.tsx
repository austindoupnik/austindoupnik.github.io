import {Link} from 'gatsby';
import * as styles from './social-media.module.scss';
import React, {ReactElement} from 'react';
import {FaGithub, FaRssSquare, FaTag} from 'react-icons/fa';

export default function SocialMedia(): ReactElement {
  return (
    <div className={styles.container}>
      <Link className={styles.tagLink} to="/tag">
        <FaTag/>
      </Link>
      <a className={styles.githubLink} href="https://github.com/austindoupnik">
        <FaGithub/>
      </a>
      <Link className={styles.rssLink} to="/rss.xml">
        <FaRssSquare/>
      </Link>
    </div>
  );
}