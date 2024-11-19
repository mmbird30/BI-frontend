import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import '@umijs/max';
import React from 'react';
const Footer: React.FC = () => {
  const defaultMessage = 'mmbird';
  const currentYear = new Date().getFullYear();
  return (
    <DefaultFooter
      style={{
        background: 'none',
      }}
      copyright={`${currentYear} ${defaultMessage}`}
      links={[
        {
          key: '智能BI',
          title: '智能BI',
          href: 'https://pro.ant.design',
          blankTarget: true,
        },
        {
          key: 'github',
          title: <GithubOutlined />,
          href: 'https://github.com/mmbird30/Bi.git',
          blankTarget: true,
        },
        {
          key: '智能BI',
          title: '智能BI',
          href: 'https://github.com/mmbird30/Bi.git',
          blankTarget: true,
        },
      ]}
    />
  );
};
export default Footer;
