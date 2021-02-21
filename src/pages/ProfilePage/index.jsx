import React, { Component }  from 'react';
import { PageHeader, Card, Image, Descriptions, Button, Modal, Form, Input, message, Tag, Empty } from 'antd';
import { 
  PlusOutlined,  
  SyncOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { Link } from "react-router-dom";
import getQuery from '../../utils/getQuery.js';
import { eventStop } from '../../utils/eventStop';
import LoadingPage from '../../components/loading-page';
import reqwest from 'reqwest';
import './index.less'; 

const { TextArea } = Input;

const firstGridStyle = {
  width: '100%',
  textAlign: 'center',
  marginTop: 0,
  borderRadius: 15
};

const gridStyle = {
  width: '100%',
  textAlign: 'center',
  marginTop: 5,
  borderRadius: 15
};

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 18 },
};

// 日期格式化
Date.prototype.Format = function (fmt) {
  var o = {
      "M+": this.getMonth() + 1, //月份 
      "d+": this.getDate(), //日 
      "H+": this.getHours(), //小时 
      "m+": this.getMinutes(), //分 
      "s+": this.getSeconds(), //秒 
      "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
      "S": this.getMilliseconds() //毫秒 
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
  if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}

class ProfilePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      confirmLoading: false,
      username: '',
      avatar: '',
      projectList: [],
      loading: true
    }
    this.query = getQuery();
    this.modalValueObject = {};
  }

  componentDidMount () {
    this.getUserInfo();
    this.getUserList();
  }

  getUserInfo = () => {
    reqwest({
      url: `${window.requestUrl}/get/user_info`,
      method: 'get',
      type: 'json',
      crossOrigin: true, /* 跨域请求 */
      data: {
        user_id: localStorage.getItem('skyTowerUserId')
      }
    }).then((res) => {
      const { err_no, err_message, data } = res;
      const { username, avatar } = data;
      
      if (err_no === 0 && err_message === 'success') {
        this.setState({
          username,
          avatar,
          loading: false
        });
      }
    });
  }

  getUserList = () => {
    reqwest({
      url: `${window.requestUrl}/get/user_list`,
      method: 'get',
      type: 'json',
      crossOrigin: true, /* 跨域请求 */
      data: {
        user_id: this.query.user_id,
      }
    }).then((res) => {
      const { err_no, err_message, data } = res;
      const { user_list } = data;

      if (err_no === 0) {
        this.setState({
          projectList: user_list
        })
      } else {
        message.error(err_message || '似乎有点问题...');
      }
    });
  }

  showModal = (e) => {
    eventStop(e);
    this.setState({
      visible: true
    })
  };

  handleModalValueChange = (changeValue, allValue) => {
    if (!changeValue) {
      return;
    }
    this.modalValueObject = allValue;
  }

  handleOk = () => {
    this.setState({
      confirmLoading: true
    })

    this.createNewProject(this.modalValueObject);
  };

  createNewProject = (obj) => {
    reqwest({
      url: `${window.requestUrl}/create/new_project`,
      method: 'post',
      type: 'json',
      crossOrigin: true, /* 跨域请求 */
      data: {
        user_id: this.query.user_id,
        project_name: obj.project_name,
        description: obj.description,
        url_online: obj.url_online,
        create_time: Number(new Date())
      }
    }).then((res) => {
      const { err_no, err_message } = res;

      if (err_no === 0) {
        message.success('项目创建成功 🎉');
        this.getUserList();
      } else {
        message.error(err_message || '似乎有点问题...');
      }
      this.setState({
        visible: false,
        confirmLoading: false
      });
    });
  }

  handleCancel = () => {
    this.setState({
      visible: false
    })
  };

  handleDetailButtonClick = (project_id) => {
    const { history } = this.props; 
    history.push({
      pathname: 'detail',
      search: `?project_id=${project_id}`, // 明文传参，URL上带参数
      query: {
        project_id // Query对象传参，URL上不带参数
      }
    });
  }

  render() {
    const { visible, confirmLoading, projectList, username, avatar, loading } = this.state;

    return (
      <div className="profile-page">
        <Link to='/'><PageHeader
          className="profile-page-header"
          onBack={() => {}}
          title="我的"
          subTitle="SkyTower front-end monitoring data center"
        /></Link>
        <div className="profile-page-profile">
          <Card
              hoverable
              style={{ width: '100%', marginTop: 20 }}
            >
              <div className="header-info-card">
                <div className="header-info-card-image">
                  <Image
                    width={100}
                    height={100}
                    style={{margin: 10}}
                    src={avatar}
                  />
                </div>
                <div className="header-info-card-text">
                  <Card.Meta style={{ marginTop: 20, marginLeft: 36 }} title={username} description={`项目数: ${projectList.length}`} />
                </div>
              </div>
            </Card>
            <Card style={{marginTop: 10, borderRadius: 15, marginBottom: 36}}>
              { loading && <LoadingPage /> }
              {
                 !loading && projectList.length > 0 && projectList.map((obj, index) => {
                  return (
                    <Card.Grid key={index} style={index === 0 ? firstGridStyle : gridStyle} onClick={() => this.handleDetailButtonClick(obj.project_id)}>
                      <Descriptions
                        style={{textAlign: 'left'}} 
                        title={obj.project_name}
                        extra={<Button type="primary" style={{marginTop: 16}}>详情</Button>}
                      >
                        <Descriptions.Item style={{width: '33%'}} label="项目id 💎 ">{obj.project_id}</Descriptions.Item>
                        <Descriptions.Item style={{width: '33%'}} label="线上地址 📡 "><a href={obj.url_online}>点击进入</a></Descriptions.Item>
                        <Descriptions.Item style={{width: '33%'}} label="创建时间 ⌛️ ">{new Date(obj.create_time).Format("yyyy-MM-dd")}</Descriptions.Item>
                      </Descriptions>
                      <Descriptions
                        style={{display: 'flex', justifyContent: 'space-between'}} 
                      >
                        <Descriptions.Item style={{width: '66%'}} label="项目描述 🎞 ">{obj.description}</Descriptions.Item>
                        <Descriptions.Item style={{width: '33%'}} label="监控状态 🔋 ">
                          {
                            obj.is_monitoring ? (<Tag icon={<SyncOutlined spin />} color="processing">
                              监控进行中...
                            </Tag>) : (<Tag icon={<ExclamationCircleOutlined />} color="error">
                                已停止监控
                              </Tag>
                            )
                          }
                        </Descriptions.Item>
                      </Descriptions>
                    </Card.Grid>
                  );
                })
              }
              {
                projectList.length == 0 && (
                  <div className="empty-list-container">
                    <Empty
                      image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                      imageStyle={{
                        height: 80,
                      }}
                      description={
                        <div className="empty-list-text">
                          暂无项目<a onClick={this.showModal}>{` 去创建`}</a>
                        </div>
                      }
                    >
                    </Empty>
                  </div>
                )
              }
            </Card>
        </div>
        <Button className="create-new-project-button" type="primary" onClick={this.showModal}>
          <PlusOutlined /> 创建一个新的项目
        </Button>
        <Modal
          title="创建一个新的项目"
          visible={visible}
          onOk={this.handleOk}
          confirmLoading={confirmLoading}
          onCancel={this.handleCancel}
          width={'60%'}
          okText={'创建新项目'}
          cancelText={'取消'}
          closable={false}
          destroyOnClose={true}
        >
          <Form
            {...layout}
            name="basic"
            initialValues={{ remember: true }}
            size="large"
            colon={false}
            style={{marginTop: 20}}
            onValuesChange={this.handleModalValueChange}
          >
            <Form.Item
              label="项目名称"
              name="project_name"
              rules={[{ required: true, message: '给项目起个名字' }]}
            >
              <Input allowClear />
            </Form.Item>

            <Form.Item
              label="线上地址"
              name="url_online"
              rules={[{ required: true, message: '给出项目的线上地址' }]}
            >
              <Input allowClear />
            </Form.Item>

            <Form.Item
              label="项目描述"
              name="description"
              rules={[{ required: false }]}
            >
              <TextArea autoSize={{ minRows: 3, maxRows: 6 }} allowClear />
            </Form.Item>
          </Form>          
        </Modal>
      </div>
    );
  }
}

export default ProfilePage;

