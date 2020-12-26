import React, { Component }  from 'react';
import { Card, PageHeader} from 'antd';
import { Link } from "react-router-dom";
import getQuery from '../../utils/getQuery.js';
import './index.less';


class DetailPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  componentDidMount () {
    console.log(getQuery()); // 获取项目id
  }

  render() {
    return (
      <div className="detail-page">
        <Link to='/profile'><PageHeader
          className="detail-page-header"
          onBack={() => {}}
          title={'项目详情页'}
          subTitle="SkyTower front-end monitoring data center"
        /></Link>
        <Card
          hoverable
          style={{ width: '75%', marginTop: 20 }}
        >
          aha...
          详情页
        </Card>
      </div>
    );
  }
}

export default DetailPage;
